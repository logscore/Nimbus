import { RateLimiterRedis } from "rate-limiter-flexible";
import { Redis as ValkeyRedis } from "iovalkey";

interface RateLimiterConfig {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

export function createRateLimiter(redisClient: ValkeyRedis, config: RateLimiterConfig) {
	return new RateLimiterRedis({
		storeClient: redisClient,
		keyPrefix: config.keyPrefix,
		points: config.points,
		duration: config.duration,
		blockDuration: config.blockDuration,
		inMemoryBlockOnConsumed: 150,
		inMemoryBlockDuration: 60,
	});
}
