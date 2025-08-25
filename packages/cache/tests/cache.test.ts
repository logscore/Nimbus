import { ValkeyRedis, createRedisClient, missingEnvErrorMessage, valkeyEnvVars } from "../src";
import { describe, expect, it } from "vitest";

describe("createRedisClient", () => {
	it("should return ValkeyRedis instance", () => {
		const env = {
			VALKEY_HOST: "localhost",
			VALKEY_PORT: "6379",
			VALKEY_USERNAME: "test",
			VALKEY_PASSWORD: "test",
		};
		const { redisClient } = createRedisClient(env);
		expect(redisClient).toBeInstanceOf(ValkeyRedis);
	});

	it("should throw error if Valkey env vars are missing", () => {
		expect(() => createRedisClient({})).toThrow(missingEnvErrorMessage(valkeyEnvVars));
	});

	it("should throw error if only some Valkey env vars are provided", () => {
		expect(() =>
			createRedisClient({
				VALKEY_HOST: "localhost",
				VALKEY_PORT: "6379",
			})
		).toThrow(missingEnvErrorMessage(valkeyEnvVars));
	});

	it("should configure Redis client with correct options", () => {
		const env = {
			VALKEY_HOST: "redis.example.com",
			VALKEY_PORT: "6380",
			VALKEY_USERNAME: "myuser",
			VALKEY_PASSWORD: "mypass",
		};
		const { redisClient, closeRedisClient } = createRedisClient(env);

		expect(redisClient).toBeInstanceOf(ValkeyRedis);
		expect(typeof closeRedisClient).toBe("function");
	});
});
