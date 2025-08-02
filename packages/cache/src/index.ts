import { RateLimiterRedis as ValkeyRateLimit } from "rate-limiter-flexible";
import { Ratelimit as UpstashRateLimit } from "@upstash/ratelimit";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { Redis as ValkeyRedis } from "iovalkey";

export { UpstashRateLimit, UpstashRedis, ValkeyRateLimit, ValkeyRedis };
export type RedisClient = UpstashRedis | ValkeyRedis;
export type RateLimiter = UpstashRateLimit | ValkeyRateLimit;
export type RedisClientData = { redisClient: RedisClient; closeRedisClient: () => Promise<void> };

export const upstashEnvVars = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
export const valkeyEnvVars = ["VALKEY_HOST", "VALKEY_PORT", "VALKEY_USERNAME", "VALKEY_PASSWORD"];

export interface RedisClientEnv {
	IS_EDGE_RUNTIME: boolean;
	UPSTASH_REDIS_REST_URL?: string;
	UPSTASH_REDIS_REST_TOKEN?: string;
	VALKEY_HOST?: string;
	VALKEY_PORT?: string;
	VALKEY_USERNAME?: string;
	VALKEY_PASSWORD?: string;
}

// Implementation
export function createRedisClient(env: RedisClientEnv): RedisClientData {
	if (env.IS_EDGE_RUNTIME) {
		if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
			throw new Error(missingEnvErrorMessage(upstashEnvVars));
		}
		const redisClient = new UpstashRedis({
			url: env.UPSTASH_REDIS_REST_URL,
			token: env.UPSTASH_REDIS_REST_TOKEN,
		});
		return {
			redisClient,
			closeRedisClient: async () => {},
		};
	} else {
		if (!env.VALKEY_HOST || !env.VALKEY_PORT || !env.VALKEY_USERNAME || !env.VALKEY_PASSWORD) {
			throw new Error(missingEnvErrorMessage(valkeyEnvVars));
		}
		const redisClient = new ValkeyRedis({
			port: Number(env.VALKEY_PORT),
			host: env.VALKEY_HOST,
			username: env.VALKEY_USERNAME,
			password: env.VALKEY_PASSWORD,
			lazyConnect: true,
		});
		return {
			redisClient,
			closeRedisClient: async () => {
				await redisClient.quit();
			},
		};
	}
}

export function missingEnvErrorMessage(vars: string[]) {
	return `Missing environment variables. ${vars.join(", ")} is not defined`;
}
