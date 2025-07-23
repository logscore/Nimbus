import { limitedAccessAccountSchema, updateAccountSchema } from "../src";
import { expect, describe, it, jest } from "@jest/globals";
import { z } from "zod";

jest.mock("../src/validators/provider", () => ({
	driveProviderSchema: z.enum(["google", "dropbox", "onedrive"]),
}));

jest.mock("../src/validators/string", () => ({
	limitedStringSchema: z.string().min(1).max(50),
}));

describe("limitedAccessAccountSchema", () => {
	const validData = {
		id: "user_123",
		providerId: "google",
		accountId: "acc_456",
		scope: "read_write",
		nickname: "my-drive",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it("should validate with all required fields", () => {
		const parsed = limitedAccessAccountSchema.parse(validData);
		expect(parsed).toEqual(validData);
	});

	it("should allow null nickname", () => {
		const data = { ...validData, nickname: null };
		const parsed = limitedAccessAccountSchema.parse(data);
		expect(parsed.nickname).toBeNull();
	});

	it("should throw if providerId is invalid", () => {
		const data = { ...validData, providerId: "invalid" };
		expect(() => limitedAccessAccountSchema.parse(data)).toThrow();
	});

	it("should throw if nickname is too long", () => {
		const data = { ...validData, nickname: "a".repeat(60) };
		expect(() => limitedAccessAccountSchema.parse(data)).toThrow();
	});

	it("should throw if required fields are missing", () => {
		const data = { ...validData };
		delete (data as any).id;
		expect(() => limitedAccessAccountSchema.parse(data)).toThrow();
	});
});

describe("updateAccountSchema", () => {
	it("should allow valid id and nickname", () => {
		const result = updateAccountSchema.parse({
			id: "user_123",
			nickname: "updated-name",
		});
		expect(result).toBeDefined();
	});

	it("should allow null nickname", () => {
		const result = updateAccountSchema.parse({
			id: "user_123",
			nickname: null,
		});
		expect(result.nickname).toBeNull();
	});

	it("should throw if id is missing", () => {
		expect(() => updateAccountSchema.parse({ nickname: "hello" })).toThrow();
	});

	it("should throw if nickname is too short", () => {
		expect(() => updateAccountSchema.parse({ id: "123", nickname: "" })).toThrow();
	});
});
