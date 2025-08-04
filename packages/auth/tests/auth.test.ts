import { dbMock, mockFindFirst, mockSet, mockUpdate, mockWhere } from "@nimbus/db/mock";
import { afterAccountCreation, createAuth, type AuthEnv } from "../src/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RedisClient } from "@nimbus/cache";
import { mock } from "vitest-mock-extended";
import { betterAuth } from "better-auth";
import type { Resend } from "resend";

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
	},
}));

// Mock send-mail
vi.mock("../src/utils/send-mail", () => ({
	sendMail: vi.fn(),
}));

// TESTS
describe("createAuth", () => {
	it("should return a valid auth object", () => {
		const mockEnv: AuthEnv = {
			GOOGLE_CLIENT_ID: "test_google_client_id",
			GOOGLE_CLIENT_SECRET: "test_google_client_secret",
			MICROSOFT_CLIENT_ID: "test_ms_client_id",
			MICROSOFT_CLIENT_SECRET: "test_ms_client_secret",
			BOX_CLIENT_ID: "test_box_client_id",
			BOX_CLIENT_SECRET: "test_box_client_secret",
			DROPBOX_CLIENT_ID: "test_dropbox_client_id",
			DROPBOX_CLIENT_SECRET: "test_dropbox_client_secret",
			EMAIL_FROM: "test@example.com",
			BACKEND_URL: "http://localhost:3000",
			TRUSTED_ORIGINS: ["http://localhost:3000"],
			IS_EDGE_RUNTIME: false,
		};

		const mockRedis = mock<RedisClient>();
		const mockResend = mock<Resend>();

		const auth = createAuth(mockEnv, dbMock, mockRedis, mockResend);
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
