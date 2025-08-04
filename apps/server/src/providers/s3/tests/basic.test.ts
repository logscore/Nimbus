import { cleanupTestBucket, createTestS3Provider, setupTestBucket } from "./test-utils";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { S3Provider } from "../s3-provider";

describe("S3Provider Basic Tests", () => {
	const bucketName = "basic-test-bucket";
	let s3Provider: S3Provider;
	let testFileId: string | null = null;

	beforeAll(async () => {
		await setupTestBucket(bucketName);
	});

	afterAll(async () => {
		// Cleanup: Delete test file if it exists
		if (testFileId) {
			try {
				await s3Provider.delete(testFileId);
			} catch (error) {
				console.warn("Failed to cleanup test file:", error);
			}
		}
		await cleanupTestBucket(bucketName);
	});

	describe("Basic Operations", () => {
		it("should create S3Provider instance", () => {
			s3Provider = createTestS3Provider(bucketName);
			expect(s3Provider).toBeInstanceOf(S3Provider);
		});

		it("should validate bucket access", async () => {
			const driveInfo = await s3Provider.getDriveInfo();
			expect(driveInfo).toBeTruthy();
		});

		it("should list root files", async () => {
			const files = await s3Provider.listChildren();
			expect(files).toHaveProperty("items");
			expect(Array.isArray(files.items)).toBe(true);
		});

		it("should create a test file", async () => {
			const testContent = Buffer.from("Hello from Nimbus S3 Provider! 🚀");
			const createdFile = await s3Provider.create(
				{
					name: "nimbus-test.txt",
					mimeType: "text/plain",
				},
				testContent
			);

			expect(createdFile).toBeDefined();
			if (!createdFile) return;
			expect(createdFile.name).toBe("nimbus-test.txt");
			expect(createdFile.mimeType).toBe("text/plain");
			testFileId = createdFile.id;
		});

		it("should download the created file", async () => {
			expect(testFileId).toBeDefined();
			if (!testFileId) return;
			const downloaded = await s3Provider.download(testFileId);
			expect(downloaded).toBeDefined();
			if (!downloaded) return;
			expect(downloaded.data.toString()).toBe("Hello from Nimbus S3 Provider! 🚀");
			expect(downloaded.size).toBeGreaterThan(0);
			expect(downloaded.mimeType).toBe("text/plain");
		});

		it("should delete the test file", async () => {
			expect(testFileId).toBeDefined();
			if (!testFileId) return;
			const deleted = await s3Provider.delete(testFileId);
			expect(deleted).toBe(true);

			// Verify file is actually deleted
			const files = await s3Provider.listChildren();
			const fileExists = files.items.some(item => item.id === testFileId);
			expect(fileExists).toBe(false);
		});
	});
});
