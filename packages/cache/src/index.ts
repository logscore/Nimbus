import { RateLimiterRedis as ValkeyRateLimit } from "rate-limiter-flexible";
import { Ratelimit as UpstashRateLimit } from "@upstash/ratelimit";
import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import env, { isEdge } from "@nimbus/env/server";
import { Redis as ValkeyRedis } from "iovalkey";

export { UpstashRateLimit, UpstashRedis, ValkeyRateLimit, ValkeyRedis };
export type RedisClient = InstanceType<typeof UpstashRedis> | InstanceType<typeof ValkeyRedis>;
export type RateLimiter = UpstashRateLimit | ValkeyRateLimit;

export async function redisClientInstance(): Promise<RedisClient> {
	if (isEdge) {
		if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
			throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
		}
		return new UpstashRedis({
			url: env.UPSTASH_REDIS_REST_URL,
			token: env.UPSTASH_REDIS_REST_TOKEN,
		});
	} else {
		if (!env.VALKEY_HOST || !env.VALKEY_PORT || !env.VALKEY_USERNAME || !env.VALKEY_PASSWORD) {
			throw new Error("Missing VALKEY_* env vars");
		}
		return new ValkeyRedis({
			port: Number(env.VALKEY_PORT),
			host: env.VALKEY_HOST,
			username: env.VALKEY_USERNAME,
			password: env.VALKEY_PASSWORD,
		});
	}
}

export const redisClientPromise = redisClientInstance();
