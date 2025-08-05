import {
	createFileSchema,
	downloadFileSchema,
	fileIdSchema,
	getFilesSchema,
	updateFileSchema,
	uploadFileQuerySchema,
} from "../src/validators/file";
import { describe, expect, it } from "vitest";

describe("fileIdSchema", () => {
	it("should pass with valid file ID", () => {
		const result = fileIdSchema.safeParse("abc123");
		expect(result.success).toBe(true);
	});

	it("should fail with empty ID", () => {
		const result = fileIdSchema.safeParse("");
		expect(result.success).toBe(false);
	});
});

describe("getFilesSchema", () => {
	it("should return default values when input is empty", () => {
		const result = getFilesSchema.parse({});
		expect(result.parentId).toBe("root");
		expect(result.pageSize).toBe(30);
	});

	it("should fail with too large pageSize", () => {
		const result = getFilesSchema.safeParse({ pageSize: 1000 });
		expect(result.success).toBe(false);
	});
});

describe("updateFileSchema", () => {
	it("should pass with valid name and fileId", () => {
		const result = updateFileSchema.safeParse({
			fileId: "abc123",
			name: "Valid Name",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with empty name", () => {
		const result = updateFileSchema.safeParse({
			fileId: "abc123",
			name: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("createFileSchema", () => {
	it("should pass with required fields", () => {
		const result = createFileSchema.safeParse({
			name: "file.txt",
			mimeType: "text/plain",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with empty name", () => {
		const result = createFileSchema.safeParse({
			name: "",
			mimeType: "text/plain",
		});
		expect(result.success).toBe(false);
	});
});

describe("uploadFileQuerySchema", () => {
	it("should pass with valid parentId", () => {
		const result = uploadFileQuerySchema.safeParse({
			parentId: "parent123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with empty parentId", () => {
		const result = uploadFileQuerySchema.safeParse({
			parentId: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("downloadFileSchema", () => {
	it("should pass with only fileId", () => {
		const result = downloadFileSchema.safeParse({
			fileId: "file123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail with invalid fileId", () => {
		const result = downloadFileSchema.safeParse({
			fileId: "",
		});
		expect(result.success).toBe(false);
	});

	it("should pass with acknowledgeAbuse true", () => {
		const result = downloadFileSchema.safeParse({
			fileId: "file123",
			acknowledgeAbuse: true,
		});
		expect(result.success).toBe(true);
	});
});
