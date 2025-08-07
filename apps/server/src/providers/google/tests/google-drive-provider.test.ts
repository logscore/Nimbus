import {
	createFileMetadata,
	createFolderMetadata,
	createProviderWithMockClient,
	mockGoogleDriveClient,
	mockResponses,
	resetAllMocks,
	restoreMockClient,
} from "./test-utils";
import { GoogleDriveProvider } from "../google-drive-provider";
import { beforeEach, describe, expect, it } from "vitest";
import { Readable } from "node:stream";

describe("GoogleDriveProvider Unit Tests", () => {
	let provider: GoogleDriveProvider;

	beforeEach(() => {
		resetAllMocks();
		provider = createProviderWithMockClient();
		restoreMockClient(provider);
	});

	describe("Constructor", () => {
		it("should create GoogleDriveProvider with access token", () => {
			const googleProvider = new GoogleDriveProvider("test-token");
			expect(googleProvider).toBeInstanceOf(GoogleDriveProvider);
			expect(googleProvider.getAccessToken()).toBe("test-token");
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
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFolder);

			const result = await provider.create(folderMetadata);

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith({
				requestBody: {
					name: "test-folder",
					mimeType: "application/vnd.google-apps.folder",
					parents: ["root"],
					description: undefined,
				},
			});
			expect(result).toEqual({
				id: "1G2s3T4u5V6w7X8y9Z0a1B2c3D4e5F6g7H8i9J0k",
				name: "test-folder",
				type: "folder",
				mimeType: "application/vnd.google-apps.folder",
				parentId: "root",
				size: 0,
				webViewLink: undefined,
				webContentLink: undefined,
				createdTime: "2023-01-01T12:00:00.000Z",
				modifiedTime: "2023-01-01T12:00:00.000Z",
				description: undefined,
				trashed: false,
				providerMetadata: mockResponses.createFolder.data,
			});
		});

		it("should create a file with Buffer content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Buffer.from("test content");
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFile);

			const result = await provider.create(fileMetadata, content);

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith({
				requestBody: {
					name: "test-file.txt",
					mimeType: "text/plain",
					parents: ["root"],
					description: undefined,
				},
				media: {
					mimeType: "text/plain",
					body: expect.any(Readable),
				},
			});
			expect(result).toEqual({
				id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
				name: "test-file.txt",
				type: "file",
				mimeType: "text/plain",
				parentId: "root",
				size: 11,
				webViewLink: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
				webContentLink: "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
				createdTime: "2023-01-01T12:00:00.000Z",
				modifiedTime: "2023-01-01T12:00:00.000Z",
				description: undefined,
				trashed: false,
				providerMetadata: mockResponses.createFile.data,
			});
		});

		it("should create a file with Readable stream content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Readable.from(["test content"]);
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFile);

			const result = await provider.create(fileMetadata, content);

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalled();
			expect(result).not.toBeNull();
		});

		it("should handle nested folder creation", async () => {
			const folderMetadata = createFolderMetadata({
				name: "nested-folder",
				parentId: "parent-folder-id",
			});
			const nestedFolderResponse = {
				data: {
					...mockResponses.createFolder.data,
					name: "nested-folder",
					parents: ["parent-folder-id"],
				},
			};
			mockGoogleDriveClient.files.create.mockResolvedValue(nestedFolderResponse);

			const result = await provider.create(folderMetadata);

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith({
				requestBody: {
					name: "nested-folder",
					mimeType: "application/vnd.google-apps.folder",
					parents: ["parent-folder-id"],
					description: undefined,
				},
			});
			expect(result?.parentId).toBe("parent-folder-id");
		});

		it("should map Microsoft folder MIME type to Google folder", async () => {
			const folderMetadata = createFolderMetadata({
				mimeType: "application/vnd.microsoft.folder",
			});
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFolder);

			await provider.create(folderMetadata);

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith({
				requestBody: {
					name: "test-folder",
					mimeType: "application/vnd.google-apps.folder",
					parents: ["root"],
					description: undefined,
				},
			});
		});
	});

	describe("getById", () => {
		it("should get file by ID", async () => {
			mockGoogleDriveClient.files.get.mockResolvedValue(mockResponses.getFile);

			const result = await provider.getById("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");

			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith({
				fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
				fields: expect.any(String),
			});
			expect(result).toEqual({
				id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
				name: "test-file.txt",
				type: "file",
				mimeType: "text/plain",
				parentId: "root",
				size: 11,
				webViewLink: undefined,
				webContentLink: undefined,
				createdTime: "2023-01-01T12:00:00.000Z",
				modifiedTime: "2023-01-01T12:00:00.000Z",
				description: undefined,
				trashed: false,
				providerMetadata: mockResponses.getFile.data,
			});
		});

		it("should return null when file not found", async () => {
			const notFoundError = { code: 404 };
			mockGoogleDriveClient.files.get.mockRejectedValue(notFoundError);

			const result = await provider.getById("nonexistent-id");

			expect(result).toBeNull();
		});

		it("should handle custom fields parameter", async () => {
			mockGoogleDriveClient.files.get.mockResolvedValue(mockResponses.getFile);

			await provider.getById("test-id", ["id", "name", "mimeType"]);

			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith({
				fileId: "test-id",
				fields: "id,name,mimeType",
			});
		});
	});

	describe("update", () => {
		it("should update file metadata", async () => {
			const updateMetadata = { name: "renamed-file.txt", description: "Updated description" };
			mockGoogleDriveClient.files.update.mockResolvedValue(mockResponses.updateFile);

			const result = await provider.update("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", updateMetadata);

			expect(mockGoogleDriveClient.files.update).toHaveBeenCalledWith({
				fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
				requestBody: {
					name: "renamed-file.txt",
					description: "Updated description",
				},
			});
			expect(result?.name).toBe("renamed-file.txt");
		});

		it("should move file to different parent", async () => {
			const updateMetadata = { parentId: "new-parent-id" };
			mockGoogleDriveClient.files.update.mockResolvedValue({
				data: {
					...mockResponses.updateFile.data,
					parents: ["new-parent-id"],
				},
			});

			const result = await provider.update("test-id", updateMetadata);

			expect(mockGoogleDriveClient.files.update).toHaveBeenCalledWith({
				fileId: "test-id",
				requestBody: {
					parents: ["new-parent-id"],
				},
			});
			expect(result?.parentId).toBe("new-parent-id");
		});
	});

	describe("delete", () => {
		it("should delete file permanently", async () => {
			mockGoogleDriveClient.files.delete.mockResolvedValue({});

			const result = await provider.delete("test-id", true);

			expect(mockGoogleDriveClient.files.delete).toHaveBeenCalledWith({
				fileId: "test-id",
			});
			expect(result).toBe(true);
		});

		it("should move file to trash by default", async () => {
			mockGoogleDriveClient.files.update.mockResolvedValue({});

			const result = await provider.delete("test-id");

			expect(mockGoogleDriveClient.files.update).toHaveBeenCalledWith({
				fileId: "test-id",
				requestBody: { trashed: true },
			});
			expect(result).toBe(true);
		});

		it("should return false when file not found", async () => {
			const notFoundError = { code: 404 };
			mockGoogleDriveClient.files.delete.mockRejectedValue(notFoundError);

			const result = await provider.delete("nonexistent-id", true);

			expect(result).toBe(false);
		});
	});

	describe("listChildren", () => {
		it("should list files in root folder", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.listFiles);

			const result = await provider.listChildren();

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith({
				q: "'root' in parents and trashed = false",
				pageSize: 100,
				pageToken: undefined,
				orderBy: "folder,modifiedTime desc",
				fields: expect.stringContaining("files("),
			});
			expect(result.items).toHaveLength(2);
			expect(result.nextPageToken).toBe("next-page-token-123");
		});

		it("should list files in specific folder", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.listFiles);

			await provider.listChildren("folder-id");

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					q: "'folder-id' in parents and trashed = false",
				})
			);
		});

		it("should handle pagination with page token", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.listFiles);

			await provider.listChildren("root", { pageToken: "next-token" });

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					pageToken: "next-token",
				})
			);
		});

		it("should respect page size limit", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.listFiles);

			await provider.listChildren("root", { pageSize: 50 });

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					pageSize: 50,
				})
			);
		});

		it("should include trashed files when requested", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.listFiles);

			await provider.listChildren("root", { includeTrashed: true });

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					q: "'root' in parents",
				})
			);
		});
	});

	describe("download", () => {
		it("should download regular file", async () => {
			const fileInfo = {
				data: {
					id: "test-id",
					name: "test-file.txt",
					mimeType: "text/plain",
					size: "11",
				},
			};
			mockGoogleDriveClient.files.get.mockResolvedValueOnce(fileInfo);

			// Mock the stream download with a simple buffer approach for CI compatibility
			const mockBuffer = Buffer.from("test content");
			mockGoogleDriveClient.files.get.mockResolvedValueOnce({
				data: mockBuffer,
			});

			await provider.download("test-id");

			// Verify the metadata call was made
			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith({
				fileId: "test-id",
				fields: "id, name, mimeType, size",
			});

			// Verify the download call was made
			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith(
				{
					fileId: "test-id",
					alt: "media",
					acknowledgeAbuse: undefined,
				},
				{ responseType: "stream" }
			);
		});

		it("should call export for Google Workspace files", async () => {
			const workspaceFile = {
				data: {
					id: "test-id",
					name: "test-doc",
					mimeType: "application/vnd.google-apps.document",
					size: undefined,
				},
			};
			mockGoogleDriveClient.files.get.mockResolvedValueOnce(workspaceFile);

			// Create a mock async iterable for the stream response
			const mockBuffer = Buffer.from("exported pdf content");
			const mockAsyncIterable = {
				async *[Symbol.asyncIterator]() {
					yield mockBuffer;
				},
			};

			mockGoogleDriveClient.files.export.mockResolvedValueOnce({
				data: mockAsyncIterable,
			});

			// Call download with export options
			const result = await provider.download("test-id", {
				fileId: "test-id",
				exportMimeType: "application/pdf",
			});

			// Verify the export method was called with correct parameters
			expect(mockGoogleDriveClient.files.export).toHaveBeenCalledWith(
				{
					fileId: "test-id",
					mimeType: "application/pdf",
				},
				{ responseType: "stream" }
			);

			// Verify the result
			expect(result).not.toBeNull();
			expect(result?.filename).toBe("test-doc.pdf");
			expect(result?.mimeType).toBe("application/pdf");
			expect(result?.data).toEqual(mockBuffer);
		});

		it("should return null when file not found", async () => {
			const notFoundError = { code: 404 };
			mockGoogleDriveClient.files.get.mockRejectedValue(notFoundError);

			const result = await provider.download("nonexistent-id");

			expect(result).toBeNull();
		});
	});

	describe("copy", () => {
		it("should copy file", async () => {
			mockGoogleDriveClient.files.copy.mockResolvedValue(mockResponses.copyFile);

			const result = await provider.copy("source-id", "target-parent-id");

			expect(mockGoogleDriveClient.files.copy).toHaveBeenCalledWith({
				fileId: "source-id",
				requestBody: {
					name: undefined,
					parents: ["target-parent-id"],
				},
				fields: expect.any(String),
			});
			expect(result).not.toBeNull();
		});

		it("should copy file with new name", async () => {
			mockGoogleDriveClient.files.copy.mockResolvedValue(mockResponses.copyFile);

			await provider.copy("source-id", "target-parent-id", "new-name.txt");

			expect(mockGoogleDriveClient.files.copy).toHaveBeenCalledWith(
				expect.objectContaining({
					requestBody: {
						name: "new-name.txt",
						parents: ["target-parent-id"],
					},
				})
			);
		});
	});

	describe("move", () => {
		it("should move file", async () => {
			const getFileResponse = {
				data: { parents: ["old-parent-id"] },
			};
			mockGoogleDriveClient.files.get.mockResolvedValue(getFileResponse);
			mockGoogleDriveClient.files.update.mockResolvedValue(mockResponses.moveFile);

			const result = await provider.move("source-id", "target-parent-id");

			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith({
				fileId: "source-id",
				fields: "parents",
			});
			expect(mockGoogleDriveClient.files.update).toHaveBeenCalledWith({
				fileId: "source-id",
				addParents: "target-parent-id",
				removeParents: "old-parent-id",
				fields: expect.any(String),
			});
			expect(result).not.toBeNull();
		});

		it("should move and rename file", async () => {
			const getFileResponse = {
				data: { parents: ["old-parent-id"] },
			};
			mockGoogleDriveClient.files.get.mockResolvedValue(getFileResponse);
			mockGoogleDriveClient.files.update.mockResolvedValue(mockResponses.moveFile);

			await provider.move("source-id", "target-parent-id", "new-name.txt");

			expect(mockGoogleDriveClient.files.update).toHaveBeenCalledWith({
				fileId: "source-id",
				addParents: "target-parent-id",
				removeParents: "old-parent-id",
				requestBody: { name: "new-name.txt" },
				fields: expect.any(String),
			});
		});
	});

	describe("getDriveInfo", () => {
		it("should get drive information", async () => {
			mockGoogleDriveClient.about.get.mockResolvedValue(mockResponses.driveInfo);

			const result = await provider.getDriveInfo();

			expect(mockGoogleDriveClient.about.get).toHaveBeenCalledWith({
				fields: "storageQuota(limit, usage, usageInDriveTrash), user",
			});
			expect(result).toEqual({
				totalSpace: 15000000000,
				usedSpace: 5000000000,
				trashSize: 1000000000,
				trashItems: 0,
				fileCount: 0,
				state: "normal",
				providerMetadata: {
					user: mockResponses.driveInfo.data.user,
				},
			});
		});

		it("should return null when no storage quota available", async () => {
			mockGoogleDriveClient.about.get.mockResolvedValue({
				data: {},
			});

			const result = await provider.getDriveInfo();

			expect(result).toBeNull();
		});
	});

	describe("getShareableLink", () => {
		it("should create shareable link with view permission", async () => {
			mockGoogleDriveClient.permissions.create.mockResolvedValue({});
			mockGoogleDriveClient.files.get.mockResolvedValue(mockResponses.shareableLink);

			const result = await provider.getShareableLink("test-id");

			expect(mockGoogleDriveClient.permissions.create).toHaveBeenCalledWith({
				fileId: "test-id",
				requestBody: {
					role: "reader",
					type: "anyone",
				},
			});
			expect(mockGoogleDriveClient.files.get).toHaveBeenCalledWith({
				fileId: "test-id",
				fields: "webViewLink, webContentLink",
			});
			expect(result).toBe("https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view");
		});

		it("should create shareable link with edit permission", async () => {
			mockGoogleDriveClient.permissions.create.mockResolvedValue({});
			mockGoogleDriveClient.files.get.mockResolvedValue(mockResponses.shareableLink);

			await provider.getShareableLink("test-id", "edit");

			expect(mockGoogleDriveClient.permissions.create).toHaveBeenCalledWith({
				fileId: "test-id",
				requestBody: {
					role: "writer",
					type: "anyone",
				},
			});
		});
	});

	describe("search", () => {
		it("should search files", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.searchResults);

			const result = await provider.search("test query");

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith({
				q: "name contains 'test query' and trashed = false",
				pageSize: 100,
				pageToken: undefined,
				orderBy: "folder,modifiedTime desc",
				fields: expect.stringContaining("files("),
			});
			expect(result).toBeDefined();
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.name).toBe("search-result.txt");
		});

		it("should escape single quotes in search query", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.searchResults);

			await provider.search("test's query");

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					q: "name contains 'test\\'s query' and trashed = false",
				})
			);
		});

		it("should include trashed files in search when requested", async () => {
			mockGoogleDriveClient.files.list.mockResolvedValue(mockResponses.searchResults);

			await provider.search("test", { includeTrashed: true });

			expect(mockGoogleDriveClient.files.list).toHaveBeenCalledWith(
				expect.objectContaining({
					q: "name contains 'test'",
				})
			);
		});
	});

	describe("MIME Type Mapping", () => {
		it("should map Microsoft Office types to Google types", async () => {
			const docMetadata = createFileMetadata({
				mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFile);

			await provider.create(docMetadata, Buffer.from("content"));

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith(
				expect.objectContaining({
					requestBody: expect.objectContaining({
						mimeType: "application/vnd.google-apps.document",
					}),
				})
			);
		});

		it("should preserve unknown MIME types", async () => {
			const customMetadata = createFileMetadata({
				mimeType: "application/custom-type",
			});
			mockGoogleDriveClient.files.create.mockResolvedValue(mockResponses.createFile);

			await provider.create(customMetadata, Buffer.from("content"));

			expect(mockGoogleDriveClient.files.create).toHaveBeenCalledWith(
				expect.objectContaining({
					requestBody: expect.objectContaining({
						mimeType: "application/custom-type",
					}),
				})
			);
		});
	});
});
