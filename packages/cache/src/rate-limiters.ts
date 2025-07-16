import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "./valkey";

const isProduction = process.env.NODE_ENV === "production";

// ? Should these be consolidated into one permissive rate limiter for the entire /files route? Maybe use one configurable rate limiter and configure it on a per route basis?
export const fileRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "rl:files",
	points: isProduction ? 100 : 1000,
	duration: 60 * 6,
	blockDuration: 60 * 3,
	inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
	inMemoryBlockDuration: 60,
});

export const fileGetRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "rl:files:get",
	points: isProduction ? 100 : 1000,
	duration: 60 * 6,
	blockDuration: 60 * 6,
	inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
	inMemoryBlockDuration: 60,
});

export const fileUpdateRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "rl:files:update",
	points: isProduction ? 20 : 200,
	duration: 60 * 6,
	blockDuration: 60 * 6,
	inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
	inMemoryBlockDuration: 60,
});

export const fileDeleteRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "rl:files:delete",
	points: isProduction ? 30 : 30,
	duration: 60 * 6,
	blockDuration: 60 * 6,
	inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
	inMemoryBlockDuration: 60,
});

export const fileUploadRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "rl:files:upload",
	points: isProduction ? 50 : 500,
	duration: 60 * 5,
	blockDuration: 60 * 4,
	inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
	inMemoryBlockDuration: 60,
});

export const waitlistRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	points: 3,
	duration: 120,
	blockDuration: 60 * 60,
	keyPrefix: "rl:waitlist",
	// insuranceLimiter: waitlistInsuranceLimiter, // TODO (Optional): Add insurance limiter using postgres (more-reliable than in-memory) - As we know, our app cannot function without the PostgreSQL database.
});
