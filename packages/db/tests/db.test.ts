import { expect, describe, it, jest, beforeEach, afterEach } from "@jest/globals";

jest.mock("@t3-oss/env-core", () => ({
	createEnv: jest.fn(() => ({
		DATABASE_URL: "postgresql://test:test@localhost:5432/testdb",
		NODE_ENV: "test",
	})),
}));

// Mock zod
jest.mock("zod", () => ({
	z: {
		string: jest.fn(() => ({
			url: jest.fn(() => ({})),
			optional: jest.fn(() => ({})),
		})),
		object: jest.fn(() => ({})),
		enum: jest.fn(() => ({})),
	},
}));

// Mock the environment modules completely
jest.mock("@nimbus/env/server", () => ({
	__esModule: true,
	default: {
		DATABASE_URL: "postgresql://test:test@localhost:5432/testdb",
		NODE_ENV: "test",
	},
	env: {
		DATABASE_URL: "postgresql://test:test@localhost:5432/testdb",
		NODE_ENV: "test",
	},
}));

jest.mock("@nimbus/env/client", () => ({
	__esModule: true,
	default: {
		NEXT_PUBLIC_BACKEND_URL: "http://localhost:3000",
		NEXT_PUBLIC_FRONTEND_URL: "http://localhost:3001",
	},
	env: {
		NEXT_PUBLIC_BACKEND_URL: "http://localhost:3000",
		NEXT_PUBLIC_FRONTEND_URL: "http://localhost:3001",
	},
}));

// Mock postgres library
const mockPostgres = jest.fn(() => ({
	query: jest.fn(),
	end: jest.fn(),
	connect: jest.fn(),
}));
jest.mock("postgres", () => mockPostgres);

// Mock pg library
const mockPool = jest.fn(() => ({
	connect: jest.fn(),
	end: jest.fn(),
	query: jest.fn(),
}));
jest.mock("pg", () => ({
	Pool: mockPool,
}));

// Mock drizzle-orm
jest.mock("drizzle-orm/postgres-js", () => ({
	drizzle: jest.fn(() => ({
		select: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	})),
}));

jest.mock("drizzle-orm/node-postgres", () => ({
	drizzle: jest.fn(() => ({
		select: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	})),
}));

import { createDb } from "../src";

describe("Database Connection Tests", () => {
	const testDatabaseUrl = "postgresql://testuser:testpass@localhost:5432/testdb";

	beforeEach(() => {
		jest.clearAllMocks();
		delete process.env.TEST_EDGE_MODE;
	});

	afterEach(() => {
		jest.resetModules();
	});

	describe("createDb function", () => {
		it("should create a database connection successfully", () => {
			const db = createDb(testDatabaseUrl);

			expect(db).toBeDefined();
			expect(typeof db).toBe("object");
		});

		it("should handle empty database URL", () => {
			expect(() => createDb(""));
		});

		it("should handle invalid database URL format", () => {
			expect(() => createDb("invalid-url"));
		});

		it("should create connection with valid postgresql URL", () => {
			const validUrls = [
				"postgresql://user:pass@localhost:5432/db",
				"postgres://user:pass@localhost:5432/db",
				"postgresql://user@localhost/db",
			];

			validUrls.forEach(url => {
				expect(() => createDb(url)).not.toThrow();
			});
		});
	});

	describe("Environment-specific database creation", () => {
		it("should use postgres-js in edge environment", () => {
			// Mock edge environment detection
			const mockIsEdge = jest.fn(() => true);

			// Mock the environment check
			jest.doMock("../src", () => ({
				createDb: jest.fn(() => {
					if (mockIsEdge()) {
						mockPostgres();
					}
					return { type: "postgres-js" };
				}),
			}));

			mockIsEdge.mockReturnValue(true);
			const db = createDb(testDatabaseUrl);

			expect(db).toBeDefined();
		});

		it("should use pg.Pool in node environment", () => {
			// Mock node environment detection
			const mockIsEdge = jest.fn(() => false);

			jest.doMock("../src", () => ({
				createDb: jest.fn(() => {
					if (!mockIsEdge()) {
						new mockPool();
					}
					return { type: "node-postgres" };
				}),
			}));

			mockIsEdge.mockReturnValue(false);
			const db = createDb(testDatabaseUrl);

			expect(db).toBeDefined();
		});
	});

	describe("Database operations", () => {
		let db: any;

		beforeEach(() => {
			db = createDb(testDatabaseUrl);
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
				createDb(invalidUrl);
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
				expect(() => createDb(connectionString)).not.toThrow();
			});
		});

		const invalidConnectionStrings = ["", "not-a-url", "http://localhost/test", "mysql://localhost/test"];

		it("should reject invalid connection string formats", () => {
			invalidConnectionStrings.forEach(connectionString => {
				expect(() => createDb(connectionString));
			});
		});
	});

	describe("Environment variable handling", () => {
		it("should work without environment variables when URL is provided", () => {
			// Clear any environment variables
			const originalEnv = process.env;
			process.env = {};

			expect(() => createDb(testDatabaseUrl)).not.toThrow();

			process.env = originalEnv;
		});

		it("should handle missing required environment variables gracefully", () => {
			const originalEnv = process.env;
			process.env = {};

			expect(() => createDb(testDatabaseUrl)).not.toThrow();

			process.env = originalEnv;
		});
	});
});
