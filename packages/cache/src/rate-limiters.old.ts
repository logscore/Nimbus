import { type RateLimiter, type RedisClient, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import type { SessionUser } from "@nimbus/auth/auth";
import { Redis as ValkeyRedis } from "iovalkey";

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
		points: 100,
		duration: 360, // 6 minutes
		blockDuration: 180, // 3 minutes
		keyPrefix: "rl:files",
	},
	get: {
		points: 100,
		duration: 360,
		blockDuration: 360,
		keyPrefix: "rl:files:get",
	},
	update: {
		points: 20,
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
		points: 50,
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
			inMemoryBlockOnConsumed: 150,
			inMemoryBlockDuration: 60,
		});
}

function createRateLimiter(
	isEdgeRuntime: boolean,
	redisClient: RedisClient,
	config: RateLimiterConfig
): RateLimiterFactory<RateLimiter> {
	return (identifier: string) => {
		if (isEdgeRuntime) {
			return createUpstashRateLimiter(redisClient as UpstashRedis, config)(identifier);
		} else {
			return createValkeyRateLimiter(redisClient as ValkeyRedis, config)(identifier);
		}
	};
}

type RateLimiterContext = {
	createRateLimiter: (config: RateLimiterConfig) => (identifier: string) => RateLimiter;
	key: string;
};

export function createRateLimiterContext(
	isEdgeRuntime: boolean,
	redisClient: RedisClient,
	key: string
): RateLimiterContext {
	return {
		createRateLimiter: (config: RateLimiterConfig) => createRateLimiter(isEdgeRuntime, redisClient, config),
		key,
	};
}

// Rate limiter factories
export function createUserRateLimiters({ createRateLimiter, key }: RateLimiterContext) {
	return {
		userRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.default)(user.id),
		fileRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.default)(user.id),
		fileGetRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.get)(user.id),
		fileUpdateRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.update)(user.id),
		fileDeleteRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.delete)(user.id),
		fileUploadRateLimiter: (user: SessionUser) => createRateLimiter(fileRateLimiters.upload)(user.id),
	};
}

export function createWaitlistRateLimiter({ createRateLimiter }: RateLimiterContext) {
	return (ip: string) => createRateLimiter(waitlistRateLimiterConfig)(ip);
}

// Legacy exports for backward compatibility
export const userRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "user")).userRateLimiter(user);

export const fileRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "file")).fileRateLimiter(user);

export const fileGetRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "file-get")).fileGetRateLimiter(user);

export const fileUpdateRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "file-update")).fileUpdateRateLimiter(
		user
	);

export const fileDeleteRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "file-delete")).fileDeleteRateLimiter(
		user
	);

export const fileUploadRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, user: SessionUser) =>
	createUserRateLimiters(createRateLimiterContext(isEdgeRuntime, redisClient, "file-upload")).fileUploadRateLimiter(
		user
	);

export const waitlistRateLimiter = (isEdgeRuntime: boolean, redisClient: RedisClient, ip: string) =>
	createWaitlistRateLimiter(createRateLimiterContext(isEdgeRuntime, redisClient, "waitlist"))(ip);

export type UserRateLimiter = typeof userRateLimiter;
export type WaitlistRateLimiter = typeof waitlistRateLimiter;
