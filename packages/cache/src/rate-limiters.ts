import redisClient, { type RateLimiter, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import type { SessionUser } from "@nimbus/auth/auth";
import env, { isEdge } from "@nimbus/env/server";

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

// Account creation rate limiter configuration (for S3/OneDrive/Google Drive)
const accountCreationRateLimiterConfig = {
	points: isProduction ? 5 : 50, // 5 attempts in production, 50 in dev
	duration: 600, // 10 minutes
	blockDuration: 300, // 5 minutes
	keyPrefix: "rl:account:creation",
} as const;

// Create Upstash rate limiter factory
function createUpstashRateLimiter(config: RateLimiterConfig): RateLimiterFactory<UpstashRateLimit> {
	return (identifier: string) =>
		new UpstashRateLimit({
			redis: redisClient,
			prefix: `${config.keyPrefix}${identifier}`,
			limiter: UpstashRateLimit.slidingWindow(config.points, `${Math.ceil(config.duration / 60)} s`),
			analytics: true,
		});
}

// Create Valkey rate limiter factory
function createValkeyRateLimiter(config: RateLimiterConfig): RateLimiterFactory<ValkeyRateLimit> {
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

function createRateLimiter(config: RateLimiterConfig): RateLimiterFactory<RateLimiter> {
	return (identifier: string) => {
		if (isEdge) {
			return createUpstashRateLimiter(config)(identifier);
		} else {
			return createValkeyRateLimiter(config)(identifier);
		}
	};
}

// Export the rate limiters
function userRateLimiter(user: SessionUser): RateLimiter;
function userRateLimiter(user: SessionUser): RateLimiter {
	return createRateLimiter(fileRateLimiters.default)(user.id);
}
export type UserRateLimiter = typeof userRateLimiter;

export const fileRateLimiter = (user: SessionUser) => createRateLimiter(fileRateLimiters.default)(user.id);
export const fileGetRateLimiter = (user: SessionUser) => createRateLimiter(fileRateLimiters.get)(user.id);
export const fileUpdateRateLimiter = (user: SessionUser) => createRateLimiter(fileRateLimiters.update)(user.id);
export const fileDeleteRateLimiter = (user: SessionUser) => createRateLimiter(fileRateLimiters.delete)(user.id);
export const fileUploadRateLimiter = (user: SessionUser) => createRateLimiter(fileRateLimiters.upload)(user.id);

export const waitlistRateLimiter = (ip: string) => createRateLimiter(waitlistRateLimiterConfig)(ip);
export type WaitlistRateLimiter = typeof waitlistRateLimiter;

export const accountCreationRateLimiter = (user: SessionUser) =>
	createRateLimiter(accountCreationRateLimiterConfig)(user.id);
export type AccountCreationRateLimiter = typeof accountCreationRateLimiter;
