import { forgotPasswordSchema, signInSchema, signUpSchema, resetPasswordSchema } from "../src/validators/password";
import { describe, it, expect } from "vitest";

describe("forgotPasswordSchema", () => {
	it("should pass with a valid email", () => {
		const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
		expect(result.success).toBe(true);
	});

	it("should fail with invalid email", () => {
		const result = forgotPasswordSchema.safeParse({ email: "invalid-email" });
		expect(result.success).toBe(false);
	});
});

describe("signInSchema", () => {
	it("should pass with valid data", () => {
		const result = signInSchema.safeParse({
			email: "user@example.com",
			password: "StrongPass123",
			remember: true,
		});
		expect(result.success).toBe(true);
	});

	it("should fail with weak password", () => {
		const result = signInSchema.safeParse({
			email: "user@example.com",
			password: "weak",
			remember: true,
		});
		expect(result.success).toBe(false);
	});
});

describe("signUpSchema", () => {
	it("should pass with matching passwords", () => {
		const result = signUpSchema.safeParse({
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			password: "StrongPass123",
			confirmPassword: "StrongPass123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when passwords do not match", () => {
		const result = signUpSchema.safeParse({
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			password: "StrongPass123",
			confirmPassword: "DifferentPass123",
		});
		expect(result.success).toBe(false);
		expect(result.error?.format().confirmPassword?._errors).toContain("Passwords don't match");
	});

	it("should fail if firstName is missing", () => {
		const result = signUpSchema.safeParse({
			lastName: "Doe",
			email: "john@example.com",
			password: "StrongPass123",
			confirmPassword: "StrongPass123",
		});
		expect(result.success).toBe(false);
	});
});

describe("resetPasswordSchema", () => {
	it("should pass when passwords match and are strong", () => {
		const result = resetPasswordSchema.safeParse({
			password: "StrongPass123",
			confirmPassword: "StrongPass123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when passwords do not match", () => {
		const result = resetPasswordSchema.safeParse({
			password: "StrongPass123",
			confirmPassword: "Mismatch123",
		});
		expect(result.success).toBe(false);
		expect(result.error?.format().confirmPassword?._errors).toContain("Passwords don't match");
	});

	it("should fail when password is weak", () => {
		const result = resetPasswordSchema.safeParse({
			password: "weakpass",
			confirmPassword: "weakpass",
		});
		expect(result.success).toBe(false);
	});
});
