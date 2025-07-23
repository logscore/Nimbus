import { expect, describe, it, jest, beforeEach, afterEach } from "@jest/globals";
import { UpstashRedis } from "../src/index";
import ValkeyRedis from "iovalkey";

// Mock variables
let mockIsEdge = false;
let mockEnv = {
	UPSTASH_REDIS_REST_URL: "https://example.com",
	UPSTASH_REDIS_REST_TOKEN: "token123",
	VALKEY_HOST: "localhost",
	VALKEY_PORT: "6379",
	VALKEY_USERNAME: "admin",
	VALKEY_PASSWORD: "pass",
};

// Mock the env module
jest.mock("@nimbus/env/server", () => ({
	__esModule: true,
	get default() {
		return mockEnv;
	},
	get isEdge() {
		return mockIsEdge;
	},
}));

describe("redisClientInstance", () => {
	let redisClientInstance: () => Promise<any>;

	beforeEach(async () => {
		// Clear all mocks
		jest.clearAllMocks();

		// Reset mock values to defaults
		mockIsEdge = false;
		mockEnv = {
			UPSTASH_REDIS_REST_URL: "https://example.com",
			UPSTASH_REDIS_REST_TOKEN: "token123",
			VALKEY_HOST: "localhost",
			VALKEY_PORT: "6379",
			VALKEY_USERNAME: "admin",
			VALKEY_PASSWORD: "pass",
		};

		const module = await import("../src/index");
		redisClientInstance = module.redisClientInstance;
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should return UpstashRedis instance on Edge", async () => {
		// Set up edge environment
		mockIsEdge = true;
		mockEnv.UPSTASH_REDIS_REST_URL = "https://example.com";
		mockEnv.UPSTASH_REDIS_REST_TOKEN = "token123";

		const client = await redisClientInstance();
		expect(client).toBeInstanceOf(UpstashRedis);
	});

	it("should return ValkeyRedis instance on Server", async () => {
		// Set up server environment
		mockIsEdge = false;
		mockEnv.VALKEY_HOST = "localhost";
		mockEnv.VALKEY_PORT = "6379";
		mockEnv.VALKEY_USERNAME = "admin";
		mockEnv.VALKEY_PASSWORD = "pass";

		const client = await redisClientInstance();
		expect(client).toBeInstanceOf(ValkeyRedis);
	});

	it("should throw error if Upstash env vars are missing", async () => {
		mockIsEdge = true;
		mockEnv.UPSTASH_REDIS_REST_URL = undefined as any;

		await expect(redisClientInstance()).rejects.toThrow(
			"Missing environment variables. UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined"
		);
	});

	it("should throw error if Valkey env vars are missing", async () => {
		mockIsEdge = false;
		mockEnv.VALKEY_HOST = undefined as any;

		await expect(redisClientInstance()).rejects.toThrow(
			"Missing environment variables. VALKEY_HOST, VALKEY_PORT, VALKEY_USERNAME, or VALKEY_PASSWORD is not defined"
		);
	});
});
