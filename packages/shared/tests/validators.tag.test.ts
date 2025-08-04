import {
	addTagsToFileSchema,
	createTagSchema,
	hexColorSchema,
	removeTagsFromFileSchema,
	tagIdSchema,
	tagNameSchema,
	updateTagSchema,
} from "../src";
import { describe, it, expect } from "vitest";

describe("tagNameSchema", () => {
	it("should pass for valid string", () => {
		const result = tagNameSchema.safeParse("Important");
		expect(result.success).toBe(true);
	});

	it("should fail for empty string", () => {
		const result = tagNameSchema.safeParse("");
		expect(result.success).toBe(false);
	});
});

describe("hexColorSchema", () => {
	it("should pass for valid hex", () => {
		const result = hexColorSchema.safeParse("#FF5733");
		expect(result.success).toBe(true);
	});

	it("should fail for invalid hex", () => {
		const result = hexColorSchema.safeParse("FF5733");
		expect(result.success).toBe(false);
	});
});

describe("tagIdSchema", () => {
	it("should pass with valid ID", () => {
		const result = tagIdSchema.safeParse("abc123");
		expect(result.success).toBe(true);
	});

	it("should fail with empty ID", () => {
		const result = tagIdSchema.safeParse("");
		expect(result.success).toBe(false);
	});
});

describe("createTagSchema", () => {
	it("should pass with name and optional parentId", () => {
		const result = createTagSchema.safeParse({
			name: "Work",
			color: "#123456",
			parentId: "parent-id",
		});
		expect(result.success).toBe(true);
	});

	it("should use default color when not provided", () => {
		const result = createTagSchema.safeParse({
			name: "Work",
		});
		expect(result.success).toBe(true);
		expect(result.data?.color).toBe("#808080");
	});

	it("should fail with invalid color", () => {
		const result = createTagSchema.safeParse({
			name: "Work",
			color: "red",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateTagSchema", () => {
	it("should pass with partial fields", () => {
		const result = updateTagSchema.safeParse({
			id: "tag123",
			name: "New Name",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with invalid color", () => {
		const result = updateTagSchema.safeParse({
			id: "tag123",
			color: "red",
		});
		expect(result.success).toBe(false);
	});
});

describe("addTagsToFileSchema", () => {
	it("should pass with valid fileId and tagIds", () => {
		const result = addTagsToFileSchema.safeParse({
			fileId: "file-123",
			tagIds: ["tag-1", "tag-2"],
		});
		expect(result.success).toBe(true);
	});

	it("should fail with empty tagIds array", () => {
		const result = addTagsToFileSchema.safeParse({
			fileId: "file-123",
			tagIds: [],
		});
		expect(result.success).toBe(false);
	});

	it("should fail with empty fileId", () => {
		const result = addTagsToFileSchema.safeParse({
			fileId: "",
			tagIds: ["tag-1"],
		});
		expect(result.success).toBe(false);
	});
});

describe("removeTagsFromFileSchema", () => {
	it("should pass with valid data", () => {
		const result = removeTagsFromFileSchema.safeParse({
			fileId: "file-123",
			tagIds: ["tag-1", "tag-2"],
		});
		expect(result.success).toBe(true);
	});
});
