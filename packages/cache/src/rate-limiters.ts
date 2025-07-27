import {
	type RateLimiter,
	redisClientPromise,
	UpstashRateLimit,
	ValkeyRateLimit,
	UpstashRedis,
	ValkeyRedis,
} from "@nimbus/cache";
import type { SessionUser } from "@nimbus/auth/auth";
import env, { isEdge } from "@nimbus/env/server";

// Required type for middleware
export type UserRateLimiter = (user: SessionUser) => RateLimiter;

const isProduction = env.NODE_ENV === "production";

interface RateLimiterConfig {
	points: number;
	duration: number;
	blockDuration?: number;
	keyPrefix: string;
}

// ----- CONFIG -----
const fileRateLimiters = {
	default: {
		points: isProduction ? 100 : 1000,
		duration: 360,
		blockDuration: 180,
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
		points: 30,
		duration: 360,
		blockDuration: 360,
		keyPrefix: "rl:files:delete",
	},
	upload: {
		points: isProduction ? 50 : 500,
		duration: 300,
		blockDuration: 240,
		keyPrefix: "rl:files:upload",
	},
} as const;

const waitlistRateLimiterConfig = {
	points: 3,
	duration: 120,
	blockDuration: 60,
	keyPrefix: "rl:waitlist",
} as const;

// ----- FACTORIES -----

// Create Upstash rate limiter
async function createUpstashRateLimiter(config: RateLimiterConfig, identifier: string): Promise<UpstashRateLimit> {
	const redisClient = await redisClientPromise;

	if (!(redisClient instanceof UpstashRedis)) {
		throw new Error("redisClient is not an instance of UpstashRedis");
	}

	return new UpstashRateLimit({
		redis: redisClient,
		prefix: `${config.keyPrefix}${identifier}`,
		limiter: UpstashRateLimit.slidingWindow(config.points, `${Math.ceil(config.duration / 60)} s`),
		analytics: true,
	});
}

// Create Valkey rate limiter
async function createValkeyRateLimiter(config: RateLimiterConfig, identifier: string): Promise<ValkeyRateLimit> {
	const redisClient = await redisClientPromise;

	if (!(redisClient instanceof ValkeyRedis)) {
		throw new Error("redisClient is not an instance of ValkeyRedis");
	}

	return new ValkeyRateLimit({
		storeClient: redisClient,
		keyPrefix: `${config.keyPrefix}${identifier}`,
		points: config.points,
		duration: config.duration,
		blockDuration: config.blockDuration,
		inMemoryBlockOnConsumed: isProduction ? 150 : 1500,
		inMemoryBlockDuration: 60,
	});
}

// Create abstracted rate limiter
async function createRateLimiter(config: RateLimiterConfig, identifier: string): Promise<RateLimiter> {
	return isEdge
		? await createUpstashRateLimiter(config, identifier)
		: await createValkeyRateLimiter(config, identifier);
}

// ----- EXPORTED WRAPPERS (all async) -----

export const fileRateLimiter = async (user: SessionUser) => await createRateLimiter(fileRateLimiters.default, user.id);

export const fileGetRateLimiter = async (user: SessionUser) => await createRateLimiter(fileRateLimiters.get, user.id);

export const fileUpdateRateLimiter = async (user: SessionUser) =>
	await createRateLimiter(fileRateLimiters.update, user.id);

export const fileDeleteRateLimiter = async (user: SessionUser) =>
	await createRateLimiter(fileRateLimiters.delete, user.id);

export const fileUploadRateLimiter = async (user: SessionUser) =>
	await createRateLimiter(fileRateLimiters.upload, user.id);

export const waitlistRateLimiter = async (ip: string) => await createRateLimiter(waitlistRateLimiterConfig, ip);
