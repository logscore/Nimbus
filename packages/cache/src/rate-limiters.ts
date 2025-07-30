import { type RateLimiter, type RedisClient, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import type { SessionUser } from "@nimbus/auth";
import { Redis as ValkeyRedis } from "iovalkey";
import { isProduction } from "@nimbus/env";

interface RateLimiterConfig {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

interface RateLimiterFactory<T extends RateLimiter> {
	(identifier: string): T;
}

export interface CreateRateLimiterContext {
	isEdgeRuntime: boolean;
	redisClient: RedisClient;
	config: RateLimiterConfig;
	identifier: string;
}

// Rate limiter configurations
const waitlistRateLimiterConfig = {
	points: isProduction ? 3 : 10,
	duration: 60,
	blockDuration: 300,
	keyPrefix: "rl:waitlist:",
} as const;

const fileRateLimiters = {
	default: {
		points: isProduction ? 100 : 1000,
		duration: 60,
		blockDuration: 60,
		keyPrefix: "rl:file:default:",
	},
	get: {
		points: isProduction ? 200 : 2000,
		duration: 60,
		blockDuration: 60,
		keyPrefix: "rl:file:get:",
	},
	update: {
		points: isProduction ? 50 : 500,
		duration: 60,
		blockDuration: 120,
		keyPrefix: "rl:file:update:",
	},
	delete: {
		points: isProduction ? 20 : 200,
		duration: 60,
		blockDuration: 300,
		keyPrefix: "rl:file:delete:",
	},
	upload: {
		points: isProduction ? 10 : 100,
		duration: 60,
		blockDuration: 300,
		keyPrefix: "rl:file:upload:",
	},
} as const;

// Account creation rate limiter configuration (for S3/OneDrive/Google Drive)
const accountCreationRateLimiterConfig = {
	points: isProduction ? 5 : 50, // 5 attempts in production, 50 in dev
	duration: 600, // 10 minutes
	blockDuration: 300, // 5 minutes
	keyPrefix: "rl:account:creation:",
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
			inMemoryBlockOnConsumed: 150,
			inMemoryBlockDuration: 60,
		});
}

export function createRateLimiter(ctx: CreateRateLimiterContext): RateLimiter {
	if (ctx.isEdgeRuntime) {
		return createUpstashRateLimiter(ctx.redisClient as UpstashRedis, ctx.config)(ctx.identifier);
	} else {
		return createValkeyRateLimiter(ctx.redisClient as ValkeyRedis, ctx.config)(ctx.identifier);
	}
}

// Export the rate limiters
export const fileRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: fileRateLimiters.default,
		identifier: user.id,
	});

export const fileGetRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: fileRateLimiters.get,
		identifier: user.id,
	});

export const fileUpdateRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: fileRateLimiters.update,
		identifier: user.id,
	});

export const fileDeleteRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: fileRateLimiters.delete,
		identifier: user.id,
	});

export const fileUploadRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: fileRateLimiters.upload,
		identifier: user.id,
	});

export const waitlistRateLimiter = (ip: string) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: waitlistRateLimiterConfig,
		identifier: ip,
	});

export const accountCreationRateLimiter = (user: SessionUser) =>
	createRateLimiter({
		isEdgeRuntime: false,
		redisClient: {} as RedisClient,
		config: accountCreationRateLimiterConfig,
		identifier: user.id,
	});

export type UserRateLimiter = typeof fileRateLimiter;
export type WaitlistRateLimiter = typeof waitlistRateLimiter;
export type AccountCreationRateLimiter = typeof accountCreationRateLimiter;
