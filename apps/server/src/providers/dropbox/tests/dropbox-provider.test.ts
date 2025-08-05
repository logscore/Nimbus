import {
	createProviderWithMockClient,
	createFileMetadata,
	createFolderMetadata,
	mockDropboxClient,
	mockResponses,
	resetAllMocks,
	restoreMockClient,
} from "./test-utils";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { DropboxProvider } from "../dropbox-provider";
import { Readable } from "node:stream";

describe("DropboxProvider", () => {
	let provider: DropboxProvider;

	beforeEach(() => {
		resetAllMocks();
		provider = createProviderWithMockClient();
		// Ensure mock client is properly set
		restoreMockClient(provider);
	});

	describe("Constructor", () => {
		it("should create DropboxProvider with access token", () => {
			const dropboxProvider = new DropboxProvider("test-token");
			expect(dropboxProvider).toBeInstanceOf(DropboxProvider);
			expect(dropboxProvider.getAccessToken()).toBe("test-token");
		});
	});

	describe("Authentication Interface", () => {
		it("should get and set access token", () => {
			const authProvider = createProviderWithMockClient();
			expect(authProvider.getAccessToken()).toBe("mock-access-token");

			authProvider.setAccessToken("new-token");
			restoreMockClient(authProvider);
			expect(authProvider.getAccessToken()).toBe("new-token");
		});
	});

	describe("create", () => {
		it("should create a folder", async () => {
			const folderMetadata = createFolderMetadata();
			mockDropboxClient.filesCreateFolderV2.mockResolvedValue(mockResponses.createFolder);

			const result = await provider.create(folderMetadata);

			expect(mockDropboxClient.filesCreateFolderV2).toHaveBeenCalledWith({
				path: "/test-folder",
				autorename: false,
			});
			expect(result).toEqual({
				id: "/test-folder",
				name: "test-folder",
				mimeType: "application/x-directory",
				size: 0,
				createdTime: expect.any(String),
				modifiedTime: expect.any(String),
				type: "folder",
				parentId: "",
				trashed: false,
			});
		});

		it("should create a file with Buffer content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Buffer.from("test content");
			mockDropboxClient.filesUpload.mockResolvedValue(mockResponses.uploadFile);

			const result = await provider.create(fileMetadata, content);

			expect(mockDropboxClient.filesUpload).toHaveBeenCalledWith({
				path: "/test-file.txt",
				contents: content,
				mode: { ".tag": "add" },
				autorename: false,
			});
			expect(result).toEqual({
				id: "/test-file.txt",
				name: "test-file.txt",
				mimeType: "text/plain",
				size: 11,
				createdTime: "2023-01-01T12:00:00Z",
				modifiedTime: "2023-01-01T12:00:00Z",
				type: "file",
				parentId: "",
				trashed: false,
			});
		});

		it("should create a file with Readable stream content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Readable.from(["test content"]);
			mockDropboxClient.filesUpload.mockResolvedValue(mockResponses.uploadFile);

			const result = await provider.create(fileMetadata, content);

			expect(mockDropboxClient.filesUpload).toHaveBeenCalled();
			expect(result).not.toBeNull();
		});

		it("should throw error when creating file without content", async () => {
			const fileMetadata = createFileMetadata();

			await expect(provider.create(fileMetadata)).rejects.toThrow("Content is required for file upload");
		});

		it("should handle nested folder creation", async () => {
			const folderMetadata = createFolderMetadata({
				name: "nested-folder",
				parentId: "/parent-folder",
			});
			mockDropboxClient.filesCreateFolderV2.mockResolvedValue({
				result: {
					metadata: {
						...mockResponses.createFolder.result.metadata,
						path_display: "/parent-folder/nested-folder",
					},
				},
			});

			const result = await provider.create(folderMetadata);

			expect(mockDropboxClient.filesCreateFolderV2).toHaveBeenCalledWith({
				path: "/parent-folder/nested-folder",
				autorename: false,
			});
			expect(result?.parentId).toBe("/parent-folder");
		});
	});

	describe("getById", () => {
		it("should get file by ID", async () => {
			mockDropboxClient.filesGetMetadata.mockResolvedValue(mockResponses.getMetadata);

			const result = await provider.getById("/test-file.txt");

			expect(mockDropboxClient.filesGetMetadata).toHaveBeenCalledWith({
				path: "/test-file.txt",
				include_media_info: false,
				include_deleted: false,
			});
			expect(result).toEqual({
				id: "/test-file.txt",
				name: "test-file.txt",
				mimeType: "text/plain",
				size: 11,
				createdTime: "2023-01-01T12:00:00Z",
				modifiedTime: "2023-01-01T12:00:00Z",
				type: "file",
				parentId: "",
				trashed: false,
			});
		});

		it("should return null when file not found", async () => {
			const notFoundError = {
				error: {
					error: {
						".tag": "path",
						path: {
							".tag": "not_found",
						},
					},
				},
			};
			mockDropboxClient.filesGetMetadata.mockRejectedValue(notFoundError);

			const result = await provider.getById("/nonexistent.txt");

			expect(result).toBeNull();
		});
	});

	describe("update", () => {
		it("should rename/move file", async () => {
			const updateMetadata = { name: "renamed-file.txt", parentId: "", mimeType: "text/plain" };
			mockDropboxClient.filesMoveV2.mockResolvedValue(mockResponses.moveFile);

			const result = await provider.update("/test-file.txt", updateMetadata);

			expect(mockDropboxClient.filesMoveV2).toHaveBeenCalledWith({
				from_path: "/test-file.txt",
				to_path: "/renamed-file.txt",
				autorename: false,
			});
			expect(result).not.toBeNull();
		});

		it("should move file to different folder", async () => {
			const updateMetadata = { name: "test-file.txt", parentId: "/new-folder", mimeType: "text/plain" };
			mockDropboxClient.filesMoveV2.mockResolvedValue(mockResponses.moveFile);

			const _result = await provider.update("/test-file.txt", updateMetadata);

			expect(mockDropboxClient.filesMoveV2).toHaveBeenCalledWith({
				from_path: "/test-file.txt",
				to_path: "/new-folder/test-file.txt",
				autorename: false,
			});
		});
	});

	describe("delete", () => {
		it("should delete file", async () => {
			mockDropboxClient.filesDeleteV2.mockResolvedValue({});

			const result = await provider.delete("/test-file.txt");

			expect(mockDropboxClient.filesDeleteV2).toHaveBeenCalledWith({
				path: "/test-file.txt",
			});
			expect(result).toBe(true);
		});

		it("should handle delete errors", async () => {
			mockDropboxClient.filesDeleteV2.mockRejectedValue(new Error("Delete failed"));

			await expect(provider.delete("/test-file.txt")).rejects.toThrow("Delete failed");
		});
	});

	describe("listChildren", () => {
		it("should list files in root folder", async () => {
			mockDropboxClient.filesListFolder.mockResolvedValue(mockResponses.listFolder);

			const result = await provider.listChildren();

			expect(mockDropboxClient.filesListFolder).toHaveBeenCalledWith({
				path: "",
				recursive: false,
				include_media_info: false,
				include_deleted: false,
				include_has_explicit_shared_members: false,
				limit: 100,
			});
			expect(result.items).toHaveLength(2);
			expect(result.nextPageToken).toBe("cursor-123");
		});

		it("should list files in specific folder", async () => {
			mockDropboxClient.filesListFolder.mockResolvedValue(mockResponses.listFolder);

			const _result = await provider.listChildren("/test-folder");

			expect(mockDropboxClient.filesListFolder).toHaveBeenCalledWith({
				path: "/test-folder",
				recursive: false,
				include_media_info: false,
				include_deleted: false,
				include_has_explicit_shared_members: false,
				limit: 100,
			});
		});

		it("should handle pagination with page token", async () => {
			mockDropboxClient.filesListFolderContinue.mockResolvedValue(mockResponses.listFolder);

			const _result = await provider.listChildren("", { pageToken: "next-cursor" });

			expect(mockDropboxClient.filesListFolderContinue).toHaveBeenCalledWith({
				cursor: "next-cursor",
			});
		});

		it("should respect page size limit", async () => {
			mockDropboxClient.filesListFolder.mockResolvedValue(mockResponses.listFolder);

			await provider.listChildren("", { pageSize: 50 });

			expect(mockDropboxClient.filesListFolder).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 50,
				})
			);
		});

		it("should limit page size to Dropbox maximum", async () => {
			mockDropboxClient.filesListFolder.mockResolvedValue(mockResponses.listFolder);

			await provider.listChildren("", { pageSize: 5000 });

			expect(mockDropboxClient.filesListFolder).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 2000, // Dropbox max
				})
			);
		});
	});

	describe("download", () => {
		it("should download file", async () => {
			mockDropboxClient.filesDownload.mockResolvedValue(mockResponses.download);

			const result = await provider.download("/test-file.txt");

			expect(mockDropboxClient.filesDownload).toHaveBeenCalledWith({
				path: "/test-file.txt",
			});
			expect(result).toEqual({
				data: Buffer.from("test content"),
				filename: "test-file.txt",
				mimeType: "text/plain",
				size: 11,
			});
		});

		it("should return null on download error", async () => {
			const notFoundError = {
				error: {
					error: {
						".tag": "path",
						path: {
							".tag": "not_found",
						},
					},
				},
			};
			mockDropboxClient.filesDownload.mockRejectedValue(notFoundError);

			const result = await provider.download("/test-file.txt");

			expect(result).toBeNull();
		});
	});

	describe("copy", () => {
		it("should copy file", async () => {
			mockDropboxClient.filesCopyV2.mockResolvedValue(mockResponses.copy);

			const result = await provider.copy("/source.txt", "/target-folder");

			expect(mockDropboxClient.filesCopyV2).toHaveBeenCalledWith({
				from_path: "/source.txt",
				to_path: "/target-folder/source.txt",
				autorename: false,
			});
			expect(result).not.toBeNull();
		});

		it("should copy file with new name", async () => {
			mockDropboxClient.filesCopyV2.mockResolvedValue(mockResponses.copy);

			const _result = await provider.copy("/source.txt", "/target-folder", "new-name.txt");

			expect(mockDropboxClient.filesCopyV2).toHaveBeenCalledWith({
				from_path: "/source.txt",
				to_path: "/target-folder/new-name.txt",
				autorename: false,
			});
		});
	});

	describe("move", () => {
		it("should move file", async () => {
			mockDropboxClient.filesMoveV2.mockResolvedValue(mockResponses.moveFile);

			const result = await provider.move("/source.txt", "/target-folder");

			expect(mockDropboxClient.filesMoveV2).toHaveBeenCalledWith({
				from_path: "/source.txt",
				to_path: "/target-folder/source.txt",
				autorename: false,
			});
			expect(result).not.toBeNull();
		});

		it("should move file with new name", async () => {
			mockDropboxClient.filesMoveV2.mockResolvedValue(mockResponses.moveFile);

			const _result = await provider.move("/source.txt", "/target-folder", "new-name.txt");

			expect(mockDropboxClient.filesMoveV2).toHaveBeenCalledWith({
				from_path: "/source.txt",
				to_path: "/target-folder/new-name.txt",
				autorename: false,
			});
		});
	});

	describe("getDriveInfo", () => {
		it("should get drive information", async () => {
			mockDropboxClient.usersGetSpaceUsage.mockResolvedValue(mockResponses.spaceUsage);

			const result = await provider.getDriveInfo();

			expect(result).toEqual({
				totalSpace: 2000000000,
				usedSpace: 1000000,
				trashSize: 0,
				trashItems: 0,
				fileCount: 0,
				state: "normal",
			});
		});

		it("should return null on error", async () => {
			mockDropboxClient.usersGetSpaceUsage.mockRejectedValue(new Error("API error"));

			const result = await provider.getDriveInfo();

			expect(result).toBeNull();
		});

		it("should handle team allocation", async () => {
			mockDropboxClient.usersGetSpaceUsage.mockResolvedValue({
				result: {
					used: 1000000,
					allocation: {
						".tag": "team",
						allocated: 5000000000,
					},
				},
			});

			const result = await provider.getDriveInfo();

			expect(result?.totalSpace).toBe(5000000000);
		});
	});

	describe("getShareableLink", () => {
		it("should create shareable link", async () => {
			mockDropboxClient.sharingCreateSharedLinkWithSettings.mockResolvedValue(mockResponses.shareableLink);

			const result = await provider.getShareableLink("/test-file.txt");

			expect(mockDropboxClient.sharingCreateSharedLinkWithSettings).toHaveBeenCalledWith({
				path: "/test-file.txt",
				settings: {
					requested_visibility: { ".tag": "public" },
					audience: { ".tag": "public" },
					access: { ".tag": "viewer" },
				},
			});
			expect(result).toBe("https://dropbox.com/s/test-link");
		});

		it("should return null on error", async () => {
			mockDropboxClient.sharingCreateSharedLinkWithSettings.mockRejectedValue(new Error("Link creation failed"));

			const result = await provider.getShareableLink("/test-file.txt");

			expect(result).toBeNull();
		});
	});

	describe("search", () => {
		it("should search files", async () => {
			mockDropboxClient.filesSearchV2.mockResolvedValue(mockResponses.search);

			const result = await provider.search("test query");

			expect(mockDropboxClient.filesSearchV2).toHaveBeenCalledWith({
				query: "test query",
				options: {
					path: "",
					max_results: 100,
					order_by: { ".tag": "relevance" },
					file_status: { ".tag": "active" },
					filename_only: false,
				},
			});
			expect(result.items).toHaveLength(1);
			expect(result.nextPageToken).toBe("search-cursor");
		});

		it("should respect search options", async () => {
			mockDropboxClient.filesSearchV2.mockResolvedValue(mockResponses.search);

			await provider.search("test", { pageSize: 50 });

			expect(mockDropboxClient.filesSearchV2).toHaveBeenCalledWith({
				query: "test",
				options: {
					path: "",
					max_results: 50,
					order_by: { ".tag": "relevance" },
					file_status: { ".tag": "active" },
					filename_only: false,
				},
			});
		});

		it("should limit search results to Dropbox maximum", async () => {
			mockDropboxClient.filesSearchV2.mockResolvedValue(mockResponses.search);

			await provider.search("test", { pageSize: 5000 });

			expect(mockDropboxClient.filesSearchV2).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						max_results: 1000, // Dropbox search max
					}),
				})
			);
		});
	});

	describe("Path Utilities", () => {
		it("should handle root folder correctly", async () => {
			mockDropboxClient.filesListFolder.mockResolvedValue(mockResponses.listFolder);

			await provider.listChildren("");
			await provider.listChildren("/");
			await provider.listChildren("root");

			// All should normalize to empty string for root
			expect(mockDropboxClient.filesListFolder).toHaveBeenCalledTimes(3);
			mockDropboxClient.filesListFolder.mock.calls.forEach(call => {
				expect(call[0].path).toBe("");
			});
		});

		it("should normalize folder paths correctly", async () => {
			const folderMetadata = createFolderMetadata({
				name: "test-folder",
				parentId: "/parent/",
			});
			mockDropboxClient.filesCreateFolderV2.mockResolvedValue(mockResponses.createFolder);

			await provider.create(folderMetadata);

			expect(mockDropboxClient.filesCreateFolderV2).toHaveBeenCalledWith({
				path: "/parent/test-folder",
				autorename: false,
			});
		});
	});

	describe("MIME Type Handling", () => {
		it("should detect MIME types correctly", async () => {
			const fileMetadata = createFileMetadata({ name: "document.pdf" });
			mockDropboxClient.filesUpload.mockResolvedValue({
				result: {
					...mockResponses.uploadFile.result,
					name: "document.pdf",
				},
			});

			const result = await provider.create(fileMetadata, Buffer.from("content"));

			expect(result?.mimeType).toBe("application/pdf");
		});

		it("should use default MIME type for unknown extensions", async () => {
			const fileMetadata = createFileMetadata({ name: "file.unknown" });
			mockDropboxClient.filesUpload.mockResolvedValue({
				result: {
					...mockResponses.uploadFile.result,
					name: "file.unknown",
				},
			});

			const result = await provider.create(fileMetadata, Buffer.from("content"));

			expect(result?.mimeType).toBe("application/octet-stream");
		});
	});
});
