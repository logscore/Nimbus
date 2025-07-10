import { RateLimiterRedis as ValkeyRateLimit } from "rate-limiter-flexible";
import { Ratelimit as UpstashRateLimit } from "@upstash/ratelimit";
import type { Redis as UpstashRedisType } from "@upstash/redis";
import type { SessionUser } from "@nimbus/auth/auth";
import redisClient, { isEdge } from "@nimbus/cache";
import env from "@nimbus/env";

const isProduction = env.NODE_ENV === "production";

let fileRateLimiter: (user: SessionUser) => UpstashRateLimit | ValkeyRateLimit;
let fileGetRateLimiter: (user: SessionUser) => UpstashRateLimit | ValkeyRateLimit;
let fileUpdateRateLimiter: (user: SessionUser) => UpstashRateLimit | ValkeyRateLimit;
let fileDeleteRateLimiter: (user: SessionUser) => UpstashRateLimit | ValkeyRateLimit;
let fileUploadRateLimiter: (user: SessionUser) => UpstashRateLimit | ValkeyRateLimit;
let waitlistRateLimiter: (ip: string) => UpstashRateLimit | ValkeyRateLimit;

// Initialize the rate limiters based on the environment (Valkey or Upstash)
if (isEdge) {
	fileRateLimiter = (user: SessionUser) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${user.id}:files`,
			limiter: UpstashRateLimit.slidingWindow(100, "300 s"),
			analytics: true,
		});

	fileGetRateLimiter = (user: SessionUser) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${user.id}:files:get`,
			limiter: UpstashRateLimit.slidingWindow(100, "300 s"),
			analytics: true,
		});

	fileUpdateRateLimiter = (user: SessionUser) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${user.id}:files:update`,
			limiter: UpstashRateLimit.slidingWindow(20, "300 s"),
			analytics: true,
		});

	fileDeleteRateLimiter = (user: SessionUser) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${user.id}:files:delete`,
			limiter: UpstashRateLimit.slidingWindow(30, "300 s"),
			analytics: true,
		});

	fileUploadRateLimiter = (user: SessionUser) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${user.id}:files:upload`,
			limiter: UpstashRateLimit.slidingWindow(50, "300 s"),
			analytics: true,
		});

	waitlistRateLimiter = (ip: string) =>
		new UpstashRateLimit({
			redis: redisClient as UpstashRedisType,
			prefix: `rl${ip}:waitlist`,
			limiter: UpstashRateLimit.slidingWindow(3, "120 s"),
			analytics: true,
		});
} else {
	fileRateLimiter = (user: SessionUser) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${user.id}:files`,
			points: isProduction ? 100 : 1000,
			duration: 60 * 6,
			blockDuration: 60 * 3,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});

	fileGetRateLimiter = (user: SessionUser) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${user.id}:files:get`,
			points: isProduction ? 100 : 1000,
			duration: 60 * 6,
			blockDuration: 60 * 6,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});

	fileUpdateRateLimiter = (user: SessionUser) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${user.id}:files:update`,
			points: isProduction ? 20 : 200,
			duration: 60 * 6,
			blockDuration: 60 * 6,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});

	fileDeleteRateLimiter = (user: SessionUser) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${user.id}:files:delete`,
			points: isProduction ? 30 : 300,
			duration: 60 * 6,
			blockDuration: 60 * 6,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});

	fileUploadRateLimiter = (user: SessionUser) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${user.id}:files:upload`,
			points: isProduction ? 50 : 500,
			duration: 60 * 5,
			blockDuration: 60 * 4,
			inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
			inMemoryBlockDuration: 60,
		});

	waitlistRateLimiter = (ip: string) =>
		new ValkeyRateLimit({
			storeClient: redisClient,
			keyPrefix: `rl${ip}:waitlist`,
			points: 3,
			duration: 120,
			blockDuration: 60,
		});
}

// Export the rate limiters
export {
	fileRateLimiter,
	fileGetRateLimiter,
	fileUpdateRateLimiter,
	fileDeleteRateLimiter,
	fileUploadRateLimiter,
	waitlistRateLimiter,
};
