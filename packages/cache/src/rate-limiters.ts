import { type RateLimiter, type RedisClient, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { Redis as ValkeyRedis } from "iovalkey";

export interface RateLimiterConfig {
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
