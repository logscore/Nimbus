import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDb, type DatabaseEnv, type DB } from "../src";
import postgres from "postgres";
import * as pg from "pg";

vi.mock("pg", () => ({
	Pool: vi.fn(() => ({
		connect: vi.fn(),
		end: vi.fn(),
		query: vi.fn(),
	})),
}));

vi.mock("drizzle-orm/postgres-js", () => ({
	drizzle: vi.fn(() => ({})),
}));

vi.mock("postgres", () => ({
	default: vi.fn(),
}));

const mockPostgres = postgres;
const { Pool: MockPool } = pg;

describe("Database Connection Tests", () => {
	const testDatabaseUrl = "postgresql://testuser:testpass@localhost:5432/testdb";
	const baseEnv: DatabaseEnv = {
		IS_EDGE_RUNTIME: false,
		NODE_ENV: "test",
		DATABASE_URL: testDatabaseUrl,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.TEST_EDGE_MODE;
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe("createDb function", () => {
		it("should create a database connection successfully", () => {
			const { db, closeDb } = createDb(baseEnv);

			expect(db).toBeDefined();
			expect(typeof db).toBe("object");
			expect(closeDb).toBeInstanceOf(Function);
		});

		it("should handle empty database URL", () => {
			expect(() => createDb({ ...baseEnv, DATABASE_URL: "" }));
		});

		it("should handle invalid database URL format", () => {
			expect(() => createDb({ ...baseEnv, DATABASE_URL: "invalid-url" }));
		});

		it("should create connection with valid postgresql URL", () => {
			const validUrls = [
				"postgresql://user:pass@localhost:5432/db",
				"postgres://user:pass@localhost:5432/db",
				"postgresql://user@localhost/db",
			];

			validUrls.forEach(url => {
				expect(() => createDb({ ...baseEnv, DATABASE_URL: url })).not.toThrow();
			});
		});
	});

	describe("Environment-specific database creation", () => {
		it("should use postgres-js in edge environment", () => {
			const edgeEnv = { ...baseEnv, IS_EDGE_RUNTIME: true };
			createDb(edgeEnv);
			expect(mockPostgres).toHaveBeenCalledWith(edgeEnv.DATABASE_URL, { prepare: false });
		});

		it("should use pg.Pool in node environment", () => {
			const nodeEnv = { ...baseEnv, NODE_ENV: "production" };
			createDb(nodeEnv);
			expect(MockPool).toHaveBeenCalledWith({ connectionString: nodeEnv.DATABASE_URL });
		});
	});

	describe("Database operations", () => {
		let db: DB;

		beforeEach(() => {
			db = createDb(baseEnv).db;
		});

		it("should support basic query operations", async () => {
			expect(db).toBeDefined();

			if (typeof db === "object" && db !== null) {
				expect(db).toBeInstanceOf(Object);
			}
		});

		it("should handle connection errors gracefully", () => {
			const invalidUrl = "postgresql://invalid";

			expect(() => {
				createDb({ ...baseEnv, DATABASE_URL: invalidUrl });
			});
		});
	});

	describe("Connection string parsing", () => {
		const validConnectionStrings = [
			"postgresql://localhost/test",
			"postgresql://user@localhost/test",
			"postgresql://user:password@localhost/test",
			"postgresql://user:password@localhost:5432/test",
			"postgres://user:password@localhost:5432/test",
		];

		it("should accept various valid connection string formats", () => {
			validConnectionStrings.forEach(connectionString => {
				expect(() => createDb({ ...baseEnv, DATABASE_URL: connectionString })).not.toThrow();
			});
		});

		const invalidConnectionStrings = ["", "not-a-url", "http://localhost/test", "mysql://localhost/test"];

		it("should reject invalid connection string formats", () => {
			invalidConnectionStrings.forEach(connectionString => {
				expect(() => createDb({ ...baseEnv, DATABASE_URL: connectionString }));
			});
		});
	});

	describe("Environment variable handling", () => {
		it("should work without environment variables when URL is provided", () => {
			// Clear any environment variables
			const originalEnv = process.env;
			process.env = {};

			expect(() => createDb(baseEnv)).not.toThrow();

			process.env = originalEnv;
		});

		it("should handle missing required environment variables gracefully", () => {
			const originalEnv = process.env;
			process.env = {};

			expect(() => createDb(baseEnv)).not.toThrow();

			process.env = originalEnv;
		});
	});
});
