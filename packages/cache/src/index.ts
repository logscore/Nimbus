import { Redis as ValkeyRedis } from "iovalkey";
import { env } from "@nimbus/env/server";

export const cacheClient = new ValkeyRedis({
	port: Number(env.VALKEY_PORT),
	host: env.VALKEY_HOST,
	username: env.VALKEY_USERNAME,
	password: env.VALKEY_PASSWORD,
});

export type CacheClient = typeof cacheClient;
