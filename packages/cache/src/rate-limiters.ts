import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "./valkey";

const isProduction = process.env.NODE_ENV === "production";

interface RateLimiterConfig extends Partial<RateLimiterRedis> {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

/**
 * Creates a rate limiter with sensible defaults
 */
function createRateLimiter(config: RateLimiterConfig): RateLimiterRedis {
	const defaultConfig = {
		storeClient: redisClient,
		inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
		inMemoryBlockDuration: 60,
		...config,
	};

	return new RateLimiterRedis(defaultConfig);
}

// File operation rate limiters
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

// Create file rate limiters
export const fileRateLimiter = createRateLimiter(fileRateLimiters.default);
export const fileGetRateLimiter = createRateLimiter(fileRateLimiters.get);
export const fileUpdateRateLimiter = createRateLimiter(fileRateLimiters.update);
export const fileDeleteRateLimiter = createRateLimiter(fileRateLimiters.delete);
export const fileUploadRateLimiter = createRateLimiter(fileRateLimiters.upload);

// Waitlist rate limiter
export const waitlistRateLimiter = createRateLimiter({
	points: 3,
	duration: 120, // 2 minutes
	blockDuration: 3600, // 1 hour
	keyPrefix: "rl:waitlist",
	// insuranceLimiter: waitlistInsuranceLimiter, // TODO (Optional): Add insurance limiter using postgres (more-reliable than in-memory) - As we know, our app cannot function without the PostgreSQL database.
});
