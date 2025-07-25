import { type RateLimiter, type RedisClient, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import type { SessionUser } from "@nimbus/auth/auth";
import env, { isEdge } from "@nimbus/env/server";
import { Redis as ValkeyRedis } from "iovalkey";

const isProduction = env.NODE_ENV === "production";

interface RateLimiterConfig {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

interface RateLimiterFactory<T extends RateLimiter> {
	(identifier: string): T;
}

// File operation rate limiters configuration
const fileRateLimiters = {
	default: {
		points: isProduction ? 100 : 1000,
		duration: 360, // 6 minutes
		blockDuration: 180, // 3 minutes
		keyPrefix: "rl:files",
	},
	get: {
		points: isProduction ? 100 : 1000,
		duration: 360,
		blockDuration: 360,
		keyPrefix: "rl:files:get",
	},
	update: {
		points: isProduction ? 20 : 200,
		duration: 360,
		blockDuration: 360,
		keyPrefix: "rl:files:update",
	},
	delete: {
		points: 30, // Same for both environments
		duration: 360,
		blockDuration: 360,
		keyPrefix: "rl:files:delete",
	},
	upload: {
		points: isProduction ? 50 : 500,
		duration: 300, // 5 minutes
		blockDuration: 240, // 4 minutes
		keyPrefix: "rl:files:upload",
	},
} as const;

// Waitlist rate limiter configuration
const waitlistRateLimiterConfig = {
	points: 3,
	duration: 120, // 2 minutes
	blockDuration: 60, // 1 minute
	keyPrefix: "rl:waitlist",
} as const;

// Create Upstash rate limiter factory
function createUpstashRateLimiter(
	redisClient: UpstashRedis,
	config: RateLimiterConfig
): RateLimiterFactory<UpstashRateLimit> {
	return (identifier: string) =>
		new UpstashRateLimit({
			redis: redisClient,
			prefix: `${config.keyPrefix}${identifier}`,
			limiter: UpstashRateLimit.slidingWindow(config.points, `${Math.ceil(config.duration / 60)} s`),
			analytics: true,
		});
}

// Create Valkey rate limiter factory
function createValkeyRateLimiter(
	redisClient: ValkeyRedis,
	config: RateLimiterConfig
): RateLimiterFactory<ValkeyRateLimit> {
	return (identifier: string) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `${config.keyPrefix}${identifier}`,
			points: config.points,
			duration: config.duration,
			blockDuration: config.blockDuration,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});
}

function createRateLimiter(redisClient: RedisClient, config: RateLimiterConfig): RateLimiterFactory<RateLimiter> {
	return (identifier: string) => {
		if (isEdge) {
			return createUpstashRateLimiter(redisClient as UpstashRedis, config)(identifier);
		} else {
			return createValkeyRateLimiter(redisClient as ValkeyRedis, config)(identifier);
		}
	};
}

// Export the rate limiters
function userRateLimiter(redisClient: RedisClient, user: SessionUser): RateLimiter;
function userRateLimiter(redisClient: RedisClient, user: SessionUser): RateLimiter {
	return createRateLimiter(redisClient, fileRateLimiters.default)(user.id);
}
export type UserRateLimiter = typeof userRateLimiter;

export const fileRateLimiter = (redisClient: RedisClient, user: SessionUser) =>
	createRateLimiter(redisClient, fileRateLimiters.default)(user.id);
export const fileGetRateLimiter = (redisClient: RedisClient, user: SessionUser) =>
	createRateLimiter(redisClient, fileRateLimiters.get)(user.id);
export const fileUpdateRateLimiter = (redisClient: RedisClient, user: SessionUser) =>
	createRateLimiter(redisClient, fileRateLimiters.update)(user.id);
export const fileDeleteRateLimiter = (redisClient: RedisClient, user: SessionUser) =>
	createRateLimiter(redisClient, fileRateLimiters.delete)(user.id);
export const fileUploadRateLimiter = (redisClient: RedisClient, user: SessionUser) =>
	createRateLimiter(redisClient, fileRateLimiters.upload)(user.id);

export const waitlistRateLimiter = (redisClient: RedisClient, ip: string) =>
	createRateLimiter(redisClient, waitlistRateLimiterConfig)(ip);
export type WaitlistRateLimiter = typeof waitlistRateLimiter;
