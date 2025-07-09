import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { Redis as ValkeyRedis } from "iovalkey";
import env from "@nimbus/env";

export const isEdge = typeof process === "undefined" || (globalThis as any).WebSocketPair !== undefined;

async function redisClientInstance(): Promise<UpstashRedis | ValkeyRedis> {
	if (typeof process === "undefined" || (globalThis as any).WebSocketPair !== undefined) {
		const redisClient = new UpstashRedis({
			url: env.UPSTASH_REDIS_REST_URL,
			token: env.UPSTASH_REDIS_REST_TOKEN,
		});
		return redisClient as UpstashRedis;
	} else {
		const redisClient = new ValkeyRedis({
			port: Number(env.VALKEY_PORT),
			host: env.VALKEY_HOST,
			username: env.VALKEY_USERNAME,
			password: env.VALKEY_PASSWORD,
		});
		return redisClient as ValkeyRedis;
	}
}

const redisClient = await redisClientInstance();

export default redisClient;
