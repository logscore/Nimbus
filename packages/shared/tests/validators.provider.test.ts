import {
	driveProviderSchema,
	driveProviderSlugSchema,
	driveProviderParamSchema,
	driveProviderSlugParamSchema,
	providerSchema,
	slugToProvider,
	providerToSlug,
} from "../src/validators/provider";
import { describe, it, expect } from "vitest";

describe("driveProviderSchema", () => {
	it("should accept 'google'", () => {
		const result = driveProviderSchema.safeParse("google");
		expect(result.success).toBe(true);
	});

	it("should reject 'dropbox'", () => {
		const result = driveProviderSchema.safeParse("dropbox");
		expect(result.success).toBe(false);
	});
});

describe("driveProviderSlugSchema", () => {
	it("should accept 'g'", () => {
		const result = driveProviderSlugSchema.safeParse("g");
		expect(result.success).toBe(true);
	});

	it("should reject 'd'", () => {
		const result = driveProviderSlugSchema.safeParse("d");
		expect(result.success).toBe(false);
	});
});

describe("driveProviderParamSchema", () => {
	it("should pass with valid values", () => {
		const result = driveProviderParamSchema.safeParse({
			providerId: "microsoft",
			accountId: "123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with invalid provider", () => {
		const result = driveProviderParamSchema.safeParse({
			providerId: "apple",
			accountId: "123",
		});
		expect(result.success).toBe(false);
	});
});

describe("driveProviderSlugParamSchema", () => {
	it("should pass with valid values", () => {
		const result = driveProviderSlugParamSchema.safeParse({
			providerSlug: "g",
			accountId: "abc",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with invalid slug", () => {
		const result = driveProviderSlugParamSchema.safeParse({
			providerSlug: "b",
			accountId: "abc",
		});
		expect(result.success).toBe(false);
	});
});

describe("providerSchema", () => {
	it("should accept 'google'", () => {
		const result = providerSchema.safeParse("google");
		expect(result.success).toBe(true);
	});

	it("should accept 'credential'", () => {
		const result = providerSchema.safeParse("credential");
		expect(result.success).toBe(true);
	});

	it("should accept null", () => {
		const result = providerSchema.safeParse(null);
		expect(result.success).toBe(true);
	});

	it("should reject 'dropbox'", () => {
		const result = providerSchema.safeParse("dropbox");
		expect(result.success).toBe(false);
	});
});

describe("slugToProvider", () => {
	it("should return 'google' for 'g'", () => {
		expect(slugToProvider("g")).toBe("google");
	});

	it("should return undefined for 'd'", () => {
		expect(slugToProvider("d" as any)).toBeUndefined();
	});
});

describe("providerToSlug", () => {
	it("should return 'm' for 'microsoft'", () => {
		expect(providerToSlug("microsoft")).toBe("m");
	});

	it("should return undefined for 'dropbox'", () => {
		expect(providerToSlug("dropbox" as any)).toBeUndefined();
	});
});
