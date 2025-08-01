import { RateLimiterRedis as ValkeyRateLimit } from "rate-limiter-flexible";
import { Ratelimit as UpstashRateLimit } from "@upstash/ratelimit";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { Redis as ValkeyRedis } from "iovalkey";
import type { Env } from "@nimbus/env/server";

export { UpstashRateLimit, UpstashRedis, ValkeyRateLimit, ValkeyRedis };
export type RedisClient = UpstashRedis | ValkeyRedis;
export type RateLimiter = UpstashRateLimit | ValkeyRateLimit;
export type RedisClientData = { redisClient: RedisClient; closeRedisClient: () => Promise<void> };

// Implementation
export function createRedisClient(env: Env): RedisClientData {
	if (env.IS_EDGE_RUNTIME) {
		if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
			throw new Error(
				"Missing environment variables. UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined"
			);
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
			throw new Error(
				"Missing environment variables. VALKEY_HOST, VALKEY_PORT, VALKEY_USERNAME, or VALKEY_PASSWORD is not defined"
			);
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
