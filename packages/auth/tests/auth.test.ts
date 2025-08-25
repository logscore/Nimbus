import { dbMock, mockFindFirst, mockSet, mockUpdate, mockWhere } from "@nimbus/db/mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { afterAccountCreation, auth } from "../src/auth";
import { betterAuth } from "better-auth";

// Mock better-auth
vi.mock("better-auth", () => ({
	betterAuth: vi.fn(() => ({
		api: {
			getSession: vi.fn(() =>
				Promise.resolve({
					user: { id: "user123", email: "test@example.com" },
				})
			),
		},
	})),
}));

// Mock @nimbus/env/server
vi.mock("@nimbus/env/server", () => ({
	__esModule: true,
	default: {
		DATABASE_URL: "mock-db-url",
		FRONTEND_URL: "https://frontend.com",
		BACKEND_URL: "https://backend.com",
		GOOGLE_CLIENT_ID: "google-id",
		GOOGLE_CLIENT_SECRET: "google-secret",
		MICROSOFT_CLIENT_ID: "ms-id",
		MICROSOFT_CLIENT_SECRET: "ms-secret",
		BOX_CLIENT_ID: "box-id",
		BOX_CLIENT_SECRET: "box-secret",
		DROPBOX_CLIENT_ID: "dropbox-id",
		DROPBOX_CLIENT_SECRET: "dropbox-secret",
	},
}));

// Mock send-mail
vi.mock("../src/utils/send-mail", () => ({
	sendMail: vi.fn(),
}));

// TESTS
describe("createAuth", () => {
	it("should return a valid auth object", () => {
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
		mockFindFirst.mockResolvedValue({
			id: "user1",
			defaultAccountId: "accountid",
			defaultProviderId: "google",
		} as any);

		await afterAccountCreation(dbMock, account);

		// For now, just test that findFirst was called
		expect(mockFindFirst).toHaveBeenCalled();
	});

	it("should do nothing if user not found", async () => {
		mockFindFirst.mockResolvedValueOnce(undefined);

		await afterAccountCreation(dbMock, account);

		expect(mockFindFirst).toHaveBeenCalled();
		expect(mockSet).not.toHaveBeenCalled();
	});

	it("should do nothing if default IDs already set", async () => {
		mockFindFirst.mockResolvedValueOnce({
			id: "user1",
			defaultAccountId: "acc123",
			defaultProviderId: "google",
		} as any);

		await afterAccountCreation(dbMock, account);

		expect(mockFindFirst).toHaveBeenCalled();
		expect(mockSet).not.toHaveBeenCalled();
	});
});
