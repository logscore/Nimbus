import { type RateLimiter, type RedisClient, UpstashRateLimit, ValkeyRateLimit } from "@nimbus/cache";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { Redis as ValkeyRedis } from "iovalkey";

export interface RateLimiterConfig {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

export interface RateLimiterFactory<T extends RateLimiter> {
	(): T;
}

export interface CreateRateLimiterContext {
	isEdgeRuntime: boolean;
	redisClient: RedisClient;
	config: RateLimiterConfig;
}

// Create Upstash rate limiter factory
function createUpstashRateLimiter(
	redisClient: UpstashRedis,
	config: RateLimiterConfig
): RateLimiterFactory<UpstashRateLimit> {
	return () =>
		new UpstashRateLimit({
			redis: redisClient,
			// Do not include the identifier in the prefix; it's passed to limit() per request
			prefix: `${config.keyPrefix}`,
			// config.duration is in seconds (to match Valkey). Upstash accepts duration strings like "10 s".
			limiter: UpstashRateLimit.slidingWindow(config.points, `${config.duration} s`),
			analytics: true,
		});
}

// Create Valkey rate limiter factory
function createValkeyRateLimiter(
	redisClient: ValkeyRedis,
	config: RateLimiterConfig
): RateLimiterFactory<ValkeyRateLimit> {
	return () =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			// Keep prefix stable and pass identifier to consume()
			keyPrefix: `${config.keyPrefix}`,
			points: config.points,
			duration: config.duration,
			blockDuration: config.blockDuration,
			inMemoryBlockOnConsumed: 150,
			inMemoryBlockDuration: 60,
		});
}

export function createRateLimiter(ctx: CreateRateLimiterContext): RateLimiterFactory<RateLimiter> {
	if (ctx.isEdgeRuntime) {
		return createUpstashRateLimiter(ctx.redisClient as UpstashRedis, ctx.config) as RateLimiterFactory<RateLimiter>;
	} else {
		return createValkeyRateLimiter(ctx.redisClient as ValkeyRedis, ctx.config) as RateLimiterFactory<RateLimiter>;
	}
}
