// ✅ Declare mock values BEFORE jest.mock()
let mockIsEdge = false;
let mockEnv = {
	UPSTASH_REDIS_REST_URL: "https://example.com",
	UPSTASH_REDIS_REST_TOKEN: "token123",
	VALKEY_HOST: "localhost",
	VALKEY_PORT: "6379",
	VALKEY_USERNAME: "admin",
	VALKEY_PASSWORD: "pass",
};

// ✅ Now mock the env module after defining mockIsEdge and mockEnv
jest.mock("@nimbus/env/server", () => ({
	__esModule: true,
	get default() {
		return mockEnv;
	},
	get isEdge() {
		return mockIsEdge;
	},
}));

// ✅ Now import everything else
import { expect, describe, it, jest, beforeEach, afterEach } from "@jest/globals";
import { UpstashRedis, ValkeyRedis, redisClientInstance } from "../src";

describe("redisClientInstance", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Reset mock values
		mockIsEdge = false;
		mockEnv = {
			UPSTASH_REDIS_REST_URL: "https://example.com",
			UPSTASH_REDIS_REST_TOKEN: "token123",
			VALKEY_HOST: "localhost",
			VALKEY_PORT: "6379",
			VALKEY_USERNAME: "admin",
			VALKEY_PASSWORD: "pass",
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should return UpstashRedis instance on Edge", async () => {
		mockIsEdge = true;

		const client = await redisClientInstance();
		expect(client).toBeInstanceOf(UpstashRedis);
	});

	it("should return ValkeyRedis instance on Server", async () => {
		mockIsEdge = false;

		const client = await redisClientInstance();
		expect(client).toBeInstanceOf(ValkeyRedis);
	});

	it("should throw error if Upstash env vars are missing", async () => {
		mockIsEdge = true;
		mockEnv.UPSTASH_REDIS_REST_URL = undefined as any;

		await expect(redisClientInstance()).rejects.toThrow("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
	});

	it("should throw error if Valkey env vars are missing", async () => {
		mockIsEdge = false;
		mockEnv.VALKEY_HOST = undefined as any;
		await expect(redisClientInstance()).rejects.toThrow("Missing VALKEY_* env vars");
	});
});
