import {
	UpstashRedis,
	ValkeyRedis,
	createRedisClient,
	missingEnvErrorMessage,
	upstashEnvVars,
	valkeyEnvVars,
} from "../src";
import { describe, expect, it } from "vitest";

describe("createRedisClient", () => {
	it("should return UpstashRedis instance on Edge", () => {
		const { redisClient } = createRedisClient({
			IS_EDGE_RUNTIME: true,
			UPSTASH_REDIS_REST_URL: "https://test-url.com",
			UPSTASH_REDIS_REST_TOKEN: "test-token",
		});
		expect(redisClient).toBeInstanceOf(UpstashRedis);
	});

	it("should return ValkeyRedis instance on Server", () => {
		const env = {
			IS_EDGE_RUNTIME: false,
			VALKEY_HOST: "localhost",
			VALKEY_PORT: "6379",
			VALKEY_USERNAME: "test",
			VALKEY_PASSWORD: "test",
		};
		const { redisClient } = createRedisClient(env);
		expect(redisClient).toBeInstanceOf(ValkeyRedis);
	});

	it("should throw error if Upstash env vars are missing", () => {
		expect(() =>
			createRedisClient({
				IS_EDGE_RUNTIME: true,
			})
		).toThrow(missingEnvErrorMessage(upstashEnvVars));
	});

	it("should throw error if Valkey env vars are missing", () => {
		expect(() =>
			createRedisClient({
				IS_EDGE_RUNTIME: false,
			})
		).toThrow(missingEnvErrorMessage(valkeyEnvVars));
	});
});
