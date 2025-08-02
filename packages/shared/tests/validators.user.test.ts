import { userSchema, updateUserSchema } from "../src/validators/user";
import { describe, it, expect } from "vitest";

describe("userSchema", () => {
	it("should pass with valid data", () => {
		const result = userSchema.safeParse({
			id: "user-1",
			name: "John Doe",
			email: "john@example.com",
			emailVerified: true,
			image: null,
			defaultAccountId: null,
			defaultProviderId: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		expect(result.success).toBe(true);
	});

	it("should fail if createdAt is missing", () => {
		const result = userSchema.safeParse({
			id: "user-1",
			name: "John Doe",
			email: "john@example.com",
			emailVerified: true,
			image: null,
			defaultAccountId: null,
			defaultProviderId: null,
			updatedAt: new Date(),
		});
		expect(result.success).toBe(false);
	});

	it("should fail if emailVerified is not boolean", () => {
		const result = userSchema.safeParse({
			id: "user-1",
			name: "John Doe",
			email: "john@example.com",
			emailVerified: "yes", // ❌ should be boolean
			image: null,
			defaultAccountId: null,
			defaultProviderId: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		expect(result.success).toBe(false);
	});
});

describe("updateUserSchema", () => {
	it("should pass with valid IDs", () => {
		const result = updateUserSchema.safeParse({
			defaultAccountId: "acc-123",
			defaultProviderId: "g",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with missing fields", () => {
		const result = updateUserSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
