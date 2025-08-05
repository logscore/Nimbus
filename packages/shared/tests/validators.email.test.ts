import { emailObjectSchema, emailSchema, sendMailSchema } from "../src";
import { describe, it, expect } from "vitest";

describe("emailSchema", () => {
	it("should pass for a valid email", () => {
		const result = emailSchema.safeParse("john.doe@example.com");
		expect(result.success).toBe(true);
	});

	it("should fail for an email without TLD", () => {
		const result = emailSchema.safeParse("john.doe@example");
		expect(result.success).toBe(false);
	});

	it("should fail for an invalid domain label", () => {
		const result = emailSchema.safeParse("john@exa_mple.com");
		expect(result.success).toBe(false);
	});

	it("should fail for missing domain", () => {
		const result = emailSchema.safeParse("john@");
		expect(result.success).toBe(false);
	});
});

describe("sendMailSchema", () => {
	it("should pass with all valid fields", () => {
		const result = sendMailSchema.safeParse({
			to: "test@example.com",
			subject: "Hello",
			text: "World",
		});
		expect(result.success).toBe(true);
	});

	it("should fail if subject is missing", () => {
		const result = sendMailSchema.safeParse({
			to: "test@example.com",
			text: "Body",
		});
		expect(result.success).toBe(false);
	});

	it("should fail if text is empty", () => {
		const result = sendMailSchema.safeParse({
			to: "test@example.com",
			subject: "Subject",
			text: "",
		});
		expect(result.success).toBe(false);
	});

	it("should fail if email is invalid", () => {
		const result = sendMailSchema.safeParse({
			to: "invalid-email",
			subject: "Subject",
			text: "Text",
		});
		expect(result.success).toBe(false);
	});
});

describe("emailObjectSchema", () => {
	it("should pass with valid email", () => {
		const result = emailObjectSchema.safeParse({ email: "valid@example.com" });
		expect(result.success).toBe(true);
	});

	it("should fail with invalid email", () => {
		const result = emailObjectSchema.safeParse({ email: "invalid-email" });
		expect(result.success).toBe(false);
	});
});
