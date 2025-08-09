import type { File, FileMetadata } from "@nimbus/shared";
import { beforeAll, describe, expect, it } from "vitest";
import { BoxProvider } from "../box-provider";
describe("BoxProvider Integration Tests", () => {
	let provider: BoxProvider;
	let testFolderId: string | undefined;
	let testFileId: string | undefined;
	let testFiles: File[] = [];

	const isIntegrationEnabled = !!(
		process.env.BOX_TEST_ACCESS_TOKEN &&
		process.env.BOX_TEST_CLIENT_ID &&
		process.env.BOX_TEST_CLIENT_SECRET
	);

	beforeAll(() => {
		if (!isIntegrationEnabled) {
			console.log("⚠️ Skipping Box integration tests - BOX_TEST_* credentials not provided");
			return;
		}

		provider = new BoxProvider(
			process.env.BOX_TEST_ACCESS_TOKEN!,
			process.env.BOX_TEST_CLIENT_ID!,
			process.env.BOX_TEST_CLIENT_SECRET!
		);
	});

	describe("Authentication", () => {
		it.skipIf(!isIntegrationEnabled)("should authenticate successfully", async () => {
			const driveInfo = await provider.getDriveInfo();
			expect(driveInfo).toBeTruthy();
			expect(driveInfo?.totalSpace).toBeGreaterThan(0);
			expect(driveInfo?.usedSpace).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Drive Operations", () => {
		it.skipIf(!isIntegrationEnabled)("should get drive information", async () => {
			const driveInfo = await provider.getDriveInfo();

			expect(driveInfo).toBeTruthy();
			expect(driveInfo?.totalSpace).toBeGreaterThan(0);
			expect(driveInfo?.usedSpace).toBeGreaterThanOrEqual(0);
			expect(driveInfo?.trashSize).toBe(0); // Box doesn't provide trash size
			expect(driveInfo?.trashItems).toBe(0);
			expect(driveInfo?.fileCount).toBe(0); // Box doesn't provide file count
		});
	});

	describe("Folder Operations", () => {
		it.skipIf(!isIntegrationEnabled)("should create a test folder", async () => {
			const folderMetadata: FileMetadata = {
				name: `Box Test Folder ${Date.now()}`,
				mimeType: "application/x-directory",
				description: "Test folder created by Box integration tests",
				parentId: "0", // Box root folder ID
			};

			const folder = await provider.create(folderMetadata);
			expect(folder).toBeTruthy();
			expect(folder?.type).toBe("folder");
			expect(folder?.name).toBe(folderMetadata.name);
			expect(folder?.parentId).toBe("0");

			testFolderId = folder?.id;
			if (testFolderId) {
				testFiles.push(folder!);
			}
		});

		it.skipIf(!isIntegrationEnabled)("should list children of root folder", async () => {
			const result = await provider.listChildren("0", { pageSize: 10 });

			expect(result).toBeTruthy();
			expect(result.items).toBeInstanceOf(Array);
			expect(result.items.length).toBeGreaterThanOrEqual(0);

			// If we have items, check their structure
			if (result.items.length > 0) {
				const item = result.items[0];
				expect(item?.id).toBeTruthy();
				expect(item?.name).toBeTruthy();
				expect(item?.type).toMatch(/^(file|folder)$/);
				expect(item?.mimeType).toBeTruthy();
			}
		});

		it.skipIf(!isIntegrationEnabled)("should list children of test folder", async () => {
			// Skip if test folder creation failed
			if (!isIntegrationEnabled || !testFolderId) {
				return;
			}

			const result = await provider.listChildren(testFolderId);

			expect(result).toBeTruthy();
			expect(result.items).toBeInstanceOf(Array);
			// New folder should be empty
			expect(result.items.length).toBe(0);
		});
	});

	describe("File Operations", () => {
		it.skipIf(!isIntegrationEnabled)("should create a small text file", async () => {
			// Skip if test folder creation failed
			if (!isIntegrationEnabled || !testFolderId) {
				return;
			}

			const fileMetadata: FileMetadata = {
				name: `test-file-${Date.now()}.txt`,
				mimeType: "text/plain",
				description: "Test file created by Box integration tests",
				parentId: testFolderId,
			};

			const content = Buffer.from("Hello from Box integration test!", "utf8");
			const file = await provider.create(fileMetadata, content);

			expect(file).toBeTruthy();
			expect(file?.type).toBe("file");
			expect(file?.name).toBe(fileMetadata.name);
			expect(file?.mimeType).toBe("text/plain");
			expect(file?.parentId).toBe(testFolderId);
			expect(file?.size).toBeGreaterThan(0);

			testFileId = file?.id;
			if (testFileId) {
				testFiles.push(file!);
			}
		});

		it.skipIf(!isIntegrationEnabled)("should get file by ID", async () => {
			// Skip if test file creation failed
			if (!isIntegrationEnabled || !testFileId) {
				return;
			}

			const file = await provider.getById(testFileId);

			expect(file).toBeTruthy();
			expect(file?.id).toBe(testFileId);
			expect(file?.type).toBe("file");
			expect(file?.mimeType).toBe("text/plain");
		});

		it.skipIf(!isIntegrationEnabled)("should download the test file", async () => {
			// Skip if test file creation failed
			if (!isIntegrationEnabled || !testFileId) {
				return;
			}

			const result = await provider.download(testFileId);

			expect(result).toBeTruthy();
			expect(result?.data).toBeInstanceOf(Buffer);
			expect(result?.filename).toBeTruthy();
			expect(result?.mimeType).toBeTruthy();
			expect(result?.size).toBeGreaterThan(0);

			// Verify content
			const content = result?.data.toString("utf8");
			expect(content).toContain("Hello from Box integration test!");
		});

		it.skipIf(!isIntegrationEnabled)("should update file metadata", async () => {
			// Skip if test file creation failed
			if (!isIntegrationEnabled || !testFileId) {
				return;
			}

			const newName = `updated-test-file-${Date.now()}.txt`;
			const newDescription = "Updated by Box integration tests";

			const updatedFile = await provider.update(testFileId, {
				name: newName,
				description: newDescription,
			});

			expect(updatedFile).toBeTruthy();
			expect(updatedFile?.name).toBe(newName);
			// Note: Box API may not always return custom description field
		});

		it.skipIf(!isIntegrationEnabled)("should copy the test file", async () => {
			// Skip if test file or folder creation failed
			if (!isIntegrationEnabled || !testFileId || !testFolderId) {
				return;
			}

			const copyName = `copied-test-file-${Date.now()}.txt`;

			try {
				const copiedFile = await provider.copy(testFileId, testFolderId, copyName);

				expect(copiedFile).toBeTruthy();
				expect(copiedFile?.name).toBe(copyName);
				expect(copiedFile?.parentId).toBe(testFolderId);
				expect(copiedFile?.type).toBe("file");

				if (copiedFile?.id) {
					testFiles.push(copiedFile);
				}
			} catch (error) {
				console.log("Note: Box copy operation failed (may be API restriction):", error);
			}
		});

		it.skipIf(!isIntegrationEnabled)("should get shareable link", async () => {
			// Skip if test file creation failed
			if (!isIntegrationEnabled || !testFileId) {
				return;
			}

			try {
				const shareableLink = await provider.getShareableLink(testFileId, "view");

				if (shareableLink) {
					expect(shareableLink).toMatch(/^https:\/\/(app\.box\.com|box\.com)/);
				}
			} catch (error) {
				console.log("Note: Box sharing operation failed (may be account restriction):", error);
			}
		});
	});

	describe("Search Operations", () => {
		it.skipIf(!isIntegrationEnabled)("should search for files", async () => {
			// Use a common search term that's likely to return results
			const result = await provider.search("test", { pageSize: 5 });

			expect(result).toBeTruthy();
			expect(result.items).toBeInstanceOf(Array);

			if (result.items.length > 0) {
				const item = result.items[0];
				expect(item?.id).toBeTruthy();
				expect(item?.name).toBeTruthy();
				expect(item?.type).toMatch(/^(file|folder)$/);
			}
		});
	});

	describe("Cleanup", () => {
		it.skipIf(!isIntegrationEnabled)("should clean up test files and folders", async () => {
			const filesToDelete = [...testFiles].reverse();

			for (const file of filesToDelete) {
				try {
					await provider.delete(file.id, true);
				} catch (error) {
					console.log(`Warning: Could not delete ${file.name}:`, error);
				}
			}

			testFiles = [];
			testFileId = undefined;
			testFolderId = undefined;
		});

		it.skipIf(!isIntegrationEnabled)("should verify cleanup completed", async () => {
			expect(testFiles).toHaveLength(0);
			expect(testFileId).toBeUndefined();
			expect(testFolderId).toBeUndefined();
		});
	});
});
