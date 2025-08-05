import { describe, expect, it, beforeEach } from "vitest";
import { DropboxProvider } from "../dropbox-provider";

// Integration tests require real Dropbox credentials
// Tests will be automatically skipped if DROPBOX_TEST_ACCESS_TOKEN is not set
const testAccessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;

(testAccessToken ? describe : describe.skip)("DropboxProvider Integration Tests", () => {
	let provider: DropboxProvider;

	beforeEach(() => {
		provider = new DropboxProvider(testAccessToken!);
	});

	describe("Real API Integration", () => {
		it("should authenticate and get user space", async () => {
			const driveInfo = await provider.getDriveInfo();

			expect(driveInfo).not.toBeNull();
			if (driveInfo) {
				expect(driveInfo.totalSpace).toBeGreaterThan(0);
				expect(driveInfo.usedSpace).toBeGreaterThanOrEqual(0);
				expect(driveInfo.state).toBe("normal");
			}
		});

		it("should list root folder contents", async () => {
			const result = await provider.listChildren();

			expect(result).toBeDefined();
			expect(result.items).toBeInstanceOf(Array);
			// Root folder may be empty, so we just check structure
		});

		it("should create and delete a test folder", async () => {
			const folderName = `test-folder-${Date.now()}`;
			let folderId: string | undefined;

			try {
				// Create folder
				const folder = await provider.create({
					name: folderName,
					mimeType: "application/x-directory",
					parentId: "",
				});

				expect(folder).not.toBeNull();
				expect(folder?.name).toBe(folderName);
				expect(folder?.type).toBe("folder");

				folderId = folder?.id;

				// Verify folder exists
				if (folder) {
					const retrieved = await provider.getById(folder.id);
					expect(retrieved).not.toBeNull();
					expect(retrieved?.name).toBe(folderName);
				}
			} finally {
				// Cleanup: Delete folder if it was created
				if (folderId) {
					try {
						await provider.delete(folderId);
					} catch (cleanupError) {
						console.warn(`Failed to cleanup test folder ${folderId}:`, cleanupError);
					}
				}
			}

			// Verify folder is deleted
			if (folderId) {
				const shouldBeNull = await provider.getById(folderId);
				expect(shouldBeNull).toBeNull();
			}
		});

		it("should create, download, and delete a test file", async () => {
			const fileName = `test-file-${Date.now()}.txt`;
			const fileContent = "This is a test file content";
			let fileId: string | undefined;

			try {
				// Create file
				const file = await provider.create(
					{
						name: fileName,
						mimeType: "text/plain",
						parentId: "",
					},
					Buffer.from(fileContent)
				);

				expect(file).not.toBeNull();
				expect(file?.name).toBe(fileName);
				expect(file?.type).toBe("file");

				fileId = file?.id;

				if (file) {
					// Download file
					const downloadResult = await provider.download(file.id);
					expect(downloadResult).not.toBeNull();
					if (downloadResult) {
						expect(downloadResult.filename).toBe(fileName);
						expect(downloadResult.data.toString()).toBe(fileContent);
					}
				}
			} finally {
				// Cleanup: Delete file if it was created
				if (fileId) {
					try {
						await provider.delete(fileId);
					} catch (cleanupError) {
						console.warn(`Failed to cleanup test file ${fileId}:`, cleanupError);
					}
				}
			}

			// Verify file is deleted
			if (fileId) {
				const shouldBeNull = await provider.getById(fileId);
				expect(shouldBeNull).toBeNull();
			}
		});

		it("should search for files", async () => {
			// This test assumes there are some files in the Dropbox account
			const result = await provider.search("test", { pageSize: 10 });

			expect(result).toBeDefined();
			expect(result.items).toBeInstanceOf(Array);
			// Results may be empty if no files match
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid file ID gracefully", async () => {
			const result = await provider.getById("/invalid/path/that/does/not/exist");
			expect(result).toBeNull();
		});

		it("should handle invalid delete gracefully", async () => {
			await expect(provider.delete("/invalid/path")).rejects.toThrow();
		});

		it("should handle download of non-existent file", async () => {
			const result = await provider.download("/invalid/path");
			expect(result).toBeNull();
		});
	});
});
