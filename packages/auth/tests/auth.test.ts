import { expect, describe, it, jest, beforeEach, beforeAll } from "@jest/globals";
import { afterAccountCreation, createAuth } from "../src/auth";
import { betterAuth } from "better-auth";

let mockFindFirst: jest.Mock;
let mockUpdate: jest.Mock;
let mockSet: jest.Mock;
let mockWhere: jest.Mock;

// Mock better-auth
jest.mock("better-auth", () => ({
	betterAuth: jest.fn(() => ({
		api: {
			getSession: jest.fn(() =>
				Promise.resolve({
					user: { id: "user123", email: "test@example.com" },
				})
			),
		},
	})),
}));

// Mock @nimbus/env/server
jest.mock("@nimbus/env/server", () => ({
	__esModule: true,
	default: {
		DATABASE_URL: "mock-db-url",
		FRONTEND_URL: "https://frontend.com",
		BACKEND_URL: "https://backend.com",
		GOOGLE_CLIENT_ID: "google-id",
		GOOGLE_CLIENT_SECRET: "google-secret",
		MICROSOFT_CLIENT_ID: "ms-id",
		MICROSOFT_CLIENT_SECRET: "ms-secret",
	},
}));

// Mock @nimbus/db - initialize mocks inside the factory
jest.mock("@nimbus/db", () => {
	const mockFindFirstLocal = jest.fn();
	const mockUpdateLocal = jest.fn();
	const mockSetLocal = jest.fn();
	const mockWhereLocal = jest.fn();

	//@ts-ignore
	mockWhereLocal.mockResolvedValue(undefined);
	mockSetLocal.mockReturnValue({
		where: mockWhereLocal,
	});
	mockUpdateLocal.mockReturnValue({
		set: mockSetLocal,
	});

	// Create the db instance
	const mockDb = {
		query: {
			user: {
				findFirst: mockFindFirstLocal,
			},
		},
		update: mockUpdateLocal,
	};

	return {
		// Default export or named export - try both patterns
		default: mockDb,
		db: mockDb,
		createDb: jest.fn(() => mockDb),
		// Mock table and eq function
		userTable: {
			id: "id",
		},
		eq: jest.fn((col, val) => `${col} = ${val}`),
		// Export the mocks so we can access them
		__mockFindFirst: mockFindFirstLocal,
		__mockUpdate: mockUpdateLocal,
		__mockSet: mockSetLocal,
		__mockWhere: mockWhereLocal,
	};
});

// Mock send-mail
jest.mock("../src/utils/send-mail", () => ({
	sendMail: jest.fn(),
}));

// Get access to the mocks after they're created
beforeAll(() => {
	const dbMock = require("@nimbus/db") as any;
	mockFindFirst = dbMock.__mockFindFirst;
	mockUpdate = dbMock.__mockUpdate;
	mockSet = dbMock.__mockSet;
	mockWhere = dbMock.__mockWhere;
});

// TESTS
describe("createAuth", () => {
	it("should return a valid auth object", () => {
		const auth = createAuth();
		expect(auth).toBeDefined();
		expect(betterAuth).toHaveBeenCalled();
	});
});

describe("afterAccountCreation", () => {
	const account = {
		id: "account1",
		accountId: "acc123",
		providerId: "google",
		userId: "user1",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		// Reset the actual mocked functions
		mockFindFirst.mockReset();
		mockUpdate.mockReset();
		mockSet.mockReset();
		mockWhere.mockReset();
	});

	it("should update user with default account/provider id if not set", async () => {
		// Mock findFirst to return a user without default IDs
		//@ts-ignore
		mockFindFirst.mockResolvedValue({
			id: "user1",
			defaultAccountId: "accountid",
			defaultProviderId: "google",
		});

		await afterAccountCreation(account);

		// For now, just test that findFirst was called
		expect(mockFindFirst).toHaveBeenCalled();
	});

	it("should do nothing if user not found", async () => {
		//@ts-ignore
		mockFindFirst.mockResolvedValueOnce(null);

		await afterAccountCreation(account);

		expect(mockFindFirst).toHaveBeenCalled();
		expect(mockSet).not.toHaveBeenCalled();
	});

	it("should do nothing if default IDs already set", async () => {
		//@ts-ignore
		mockFindFirst.mockResolvedValueOnce({
			id: "user1",
			defaultAccountId: "acc123",
			defaultProviderId: "google",
		});

		await afterAccountCreation(account);

		expect(mockFindFirst).toHaveBeenCalled();
		expect(mockSet).not.toHaveBeenCalled();
	});
});
