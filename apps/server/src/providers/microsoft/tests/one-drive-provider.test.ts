import {
	createFileMetadata,
	createFolderMetadata,
	createProviderWithMockClient,
	generateTestBuffer,
	mockMicrosoftGraphClient,
	mockResponses,
	resetAllMocks,
} from "./test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OneDriveProvider } from "../one-drive-provider";
import { Readable } from "node:stream";

describe("OneDriveProvider", () => {
	let provider: OneDriveProvider;

	beforeEach(() => {
		resetAllMocks();
		provider = createProviderWithMockClient();
	});

	describe("Constructor", () => {
		it("should create OneDriveProvider with access token", () => {
			const mockClient = {
				api: vi.fn().mockReturnThis(),
				get: vi.fn(),
				post: vi.fn(),
				put: vi.fn(),
				patch: vi.fn(),
				delete: vi.fn(),
			};
			const oneDriveProvider = new OneDriveProvider("test-token", mockClient as any);
			expect(oneDriveProvider).toBeInstanceOf(OneDriveProvider);
			expect(oneDriveProvider.getAccessToken()).toBe("test-token");
		});
	});

	describe("Authentication Interface", () => {
		it("should get and set access token", () => {
			expect(provider.getAccessToken()).toBe("mock-access-token");

			provider.setAccessToken("new-token");
			expect(provider.getAccessToken()).toBe("new-token");
		});
	});

	describe("create", () => {
		it("should create a folder", async () => {
			const folderMetadata = createFolderMetadata();
			mockMicrosoftGraphClient.post.mockResolvedValue(mockResponses.createFolder);

			const result = await provider.create(folderMetadata);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Test Folder");
			expect(result?.type).toBe("folder");
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/items/root/children");
			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				name: "Test Folder",
				folder: {},
				file: undefined,
				description: "Test folder description",
			});
		});

		it("should create a file without content", async () => {
			const fileMetadata = createFileMetadata();
			mockMicrosoftGraphClient.post.mockResolvedValue(mockResponses.createFile);

			const result = await provider.create(fileMetadata);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("test-file.txt");
			expect(result?.type).toBe("file");
			expect(mockMicrosoftGraphClient.post).toHaveBeenCalled();
		});

		it("should create a small file with content", async () => {
			const fileMetadata = createFileMetadata();
			const content = generateTestBuffer(1024); // 1KB - small file
			mockMicrosoftGraphClient.put.mockResolvedValue(mockResponses.createFile);

			const result = await provider.create(fileMetadata, content);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("test-file.txt");
			expect(mockMicrosoftGraphClient.put).toHaveBeenCalled();
		});

		it("should create a large file with chunked upload", async () => {
			const fileMetadata = createFileMetadata({ name: "large-file.bin" });
			const largeContent = generateTestBuffer(15 * 1024 * 1024); // 15MB - large file

			// Mock upload session creation
			mockMicrosoftGraphClient.post
				.mockResolvedValueOnce(mockResponses.uploadSession) // createUploadSession
				.mockResolvedValue({}); // chunk uploads

			// Mock chunk uploads
			mockMicrosoftGraphClient.put.mockResolvedValue({});

			// Mock final get requests
			mockMicrosoftGraphClient.get
				.mockResolvedValueOnce({ file: { hashes: { sha1Hash: "mock-hash" } } }) // upload completion check
				.mockResolvedValueOnce(mockResponses.uploadComplete); // final item retrieval

			const result = await provider.create(fileMetadata, largeContent);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("large-file.bin");
			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				item: { name: "large-file.bin" },
			});
		});

		it("should handle folder creation with custom parent", async () => {
			const folderMetadata = createFolderMetadata({ parentId: "custom-parent-id" });
			mockMicrosoftGraphClient.post.mockResolvedValue(mockResponses.createFolder);

			await provider.create(folderMetadata);

			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/items/custom-parent-id/children");
		});

		it("should handle stream content for small files", async () => {
			const fileMetadata = createFileMetadata();
			const stream = new Readable({
				read() {
					this.push("test content");
					this.push(null);
				},
			});
			mockMicrosoftGraphClient.put.mockResolvedValue(mockResponses.createFile);

			const result = await provider.create(fileMetadata, stream);

			expect(result).not.toBeNull();
			expect(mockMicrosoftGraphClient.put).toHaveBeenCalled();
		});

		it("should handle creation errors", async () => {
			const fileMetadata = createFileMetadata();
			mockMicrosoftGraphClient.post.mockRejectedValue(new Error("Creation failed"));

			await expect(provider.create(fileMetadata)).rejects.toThrow("Creation failed");
		});
	});

	describe("getById", () => {
		it("should get file by ID", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.createFile);

			const result = await provider.getById("mock-file-id");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("mock-file-id");
			expect(result?.name).toBe("test-file.txt");
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id");
		});

		it("should return null for non-existent file", async () => {
			const error = new Error("Not found");
			(error as any).statusCode = 404;
			mockMicrosoftGraphClient.get.mockRejectedValue(error);

			const result = await provider.getById("non-existent-id");

			expect(result).toBeNull();
		});

		it("should throw error for other failures", async () => {
			mockMicrosoftGraphClient.get.mockRejectedValue(new Error("Server error"));

			await expect(provider.getById("mock-file-id")).rejects.toThrow("Server error");
		});
	});

	describe("update", () => {
		it("should update file metadata", async () => {
			const updatedData = { name: "updated-file.txt", description: "Updated description" };
			mockMicrosoftGraphClient.patch.mockResolvedValue({
				...mockResponses.createFile,
				...updatedData,
			});

			const result = await provider.update("mock-file-id", updatedData);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("updated-file.txt");
			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				name: "updated-file.txt",
				description: "Updated description",
			});
		});

		it("should move file to different parent", async () => {
			const updateData = { parentId: "new-parent-id" };
			mockMicrosoftGraphClient.patch
				.mockResolvedValueOnce({}) // parent change
				.mockResolvedValueOnce(mockResponses.createFile); // final update

			const result = await provider.update("mock-file-id", updateData);

			expect(result).not.toBeNull();
			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "new-parent-id" },
			});
		});

		it("should handle root parent ID correctly", async () => {
			const updateData = { parentId: "root" };
			mockMicrosoftGraphClient.patch
				.mockResolvedValueOnce({}) // parent change
				.mockResolvedValueOnce(mockResponses.createFile); // final update

			await provider.update("mock-file-id", updateData);

			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "root" },
			});
		});
	});

	describe("delete", () => {
		it("should delete file permanently", async () => {
			mockMicrosoftGraphClient.delete.mockResolvedValue(undefined);

			const result = await provider.delete("mock-file-id", true);

			expect(result).toBe(true);
			expect(mockMicrosoftGraphClient.delete).toHaveBeenCalled();
		});

		it("should move file to trash (soft delete)", async () => {
			mockMicrosoftGraphClient.patch.mockResolvedValue(undefined);

			const result = await provider.delete("mock-file-id", false);

			expect(result).toBe(true);
			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				deleted: {},
			});
		});

		it("should return false for non-existent file", async () => {
			const error = new Error("Not found");
			(error as any).statusCode = 404;
			mockMicrosoftGraphClient.delete.mockRejectedValue(error);

			const result = await provider.delete("non-existent-id", true);

			expect(result).toBe(false);
		});

		it("should throw error for other failures", async () => {
			mockMicrosoftGraphClient.delete.mockRejectedValue(new Error("Server error"));

			await expect(provider.delete("mock-file-id", true)).rejects.toThrow("Server error");
		});
	});

	describe("listChildren", () => {
		it("should list children of root folder", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.listChildren);

			const result = await provider.listChildren("root");

			expect(result.items).toHaveLength(2);
			expect(result.items[0]?.name).toBe("child-file.txt");
			expect(result.items[1]?.name).toBe("child-folder");
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/root/children");
		});

		it("should list children of specific folder", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.listChildren);

			const result = await provider.listChildren("folder-id");

			expect(result.items).toHaveLength(2);
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/items/folder-id/children");
		});

		it("should handle pagination options", async () => {
			const options = { pageSize: 50, pageToken: "next-token", orderBy: "lastModifiedDateTime" };
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.listChildren);

			await provider.listChildren("root", options);

			expect(mockMicrosoftGraphClient.query).toHaveBeenCalledWith({
				$top: 50,
				$orderby: "lastModifiedDateTime",
				$skipToken: "next-token",
			});
		});

		it("should use default options when none provided", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.listChildren);

			await provider.listChildren("root", {});

			expect(mockMicrosoftGraphClient.query).toHaveBeenCalledWith({
				$top: 100,
				$orderby: "name",
			});
		});
	});

	describe("download", () => {
		beforeEach(() => {
			// Mock global fetch
			global.fetch = vi.fn();
		});

		it("should download file successfully", async () => {
			// Create a fresh provider to avoid mock interference
			const freshMocks = {
				api: vi.fn().mockReturnThis(),
				get: vi.fn(),
			};
			const testProvider = new OneDriveProvider("test-token", freshMocks as any);

			// Mock the raw DriveItem response that includes @microsoft.graph.downloadUrl
			const rawDriveItem = {
				id: "mock-file-id",
				name: "test-file.txt",
				size: 1024,
				file: { mimeType: "text/plain" },
				createdDateTime: "2023-01-01T00:00:00Z",
				lastModifiedDateTime: "2023-01-01T00:00:00Z",
				parentReference: { id: "root" },
				webUrl: "https://onedrive.live.com/test-file",
				"@microsoft.graph.downloadUrl": "https://download.example.com/test-file",
			};

			// Mock getById's internal call (client.api().get() returns the raw DriveItem)
			freshMocks.get.mockResolvedValue(rawDriveItem);

			// Mock fetch response
			const mockArrayBuffer = new ArrayBuffer(8);
			const mockResponse = {
				ok: true,
				arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
				headers: {
					get: vi.fn().mockReturnValue("text/plain"),
				},
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await testProvider.download("mock-file-id");

			expect(result).not.toBeNull();
			expect(result?.filename).toBe("test-file.txt");
			expect(result?.mimeType).toBe("text/plain");
			expect(result?.size).toBe(8);
			expect(global.fetch).toHaveBeenCalledWith("https://download.example.com/test-file");
		});

		it("should return null when file not found", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(null);

			const result = await provider.download("non-existent-id");

			expect(result).toBeNull();
		});

		it("should return null when download URL not available", async () => {
			const fileWithoutDownloadUrl = { ...mockResponses.createFile };
			delete (fileWithoutDownloadUrl as any)["@microsoft.graph.downloadUrl"];

			mockMicrosoftGraphClient.get.mockResolvedValue(fileWithoutDownloadUrl);

			const result = await provider.download("mock-file-id");

			expect(result).toBeNull();
		});

		it("should handle download errors gracefully", async () => {
			const fileWithDownloadUrl = {
				...mockResponses.createFile,
				"@microsoft.graph.downloadUrl": "https://download.example.com/test-file",
			};

			mockMicrosoftGraphClient.get.mockResolvedValue(fileWithDownloadUrl);

			const mockResponse = {
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await provider.download("mock-file-id");

			expect(result).toBeNull();
		});

		it("should handle fetch exceptions", async () => {
			// Create a fresh provider to avoid mock interference
			const freshMocks = {
				api: vi.fn().mockReturnThis(),
				get: vi.fn(),
			};
			const testProvider = new OneDriveProvider("test-token", freshMocks as any);

			// Mock the raw DriveItem response that includes @microsoft.graph.downloadUrl
			const rawDriveItem = {
				id: "mock-file-id",
				name: "test-file.txt",
				size: 1024,
				file: { mimeType: "text/plain" },
				createdDateTime: "2023-01-01T00:00:00Z",
				lastModifiedDateTime: "2023-01-01T00:00:00Z",
				parentReference: { id: "root" },
				webUrl: "https://onedrive.live.com/test-file",
				"@microsoft.graph.downloadUrl": "https://download.example.com/test-file",
			};

			freshMocks.get.mockResolvedValue(rawDriveItem);
			(global.fetch as any).mockRejectedValue(new Error("Network error"));

			const result = await testProvider.download("mock-file-id");

			expect(result).toBeNull();
		});
	});

	describe("copy", () => {
		it("should copy file to target parent", async () => {
			const mockHeaders = {
				"content-location": "https://api.onedrive.com/operations/mock-operation-id",
			};
			mockMicrosoftGraphClient.post.mockResolvedValue({ headers: mockHeaders });

			// Mock async operation completion
			mockMicrosoftGraphClient.get
				.mockResolvedValueOnce({ status: "completed" }) // operation status
				.mockResolvedValueOnce(mockResponses.createFile); // copied item

			const result = await provider.copy("source-id", "target-parent-id", "new-name");

			expect(result).not.toBeNull();
			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
				name: "new-name",
			});
		});

		it("should handle root as target parent", async () => {
			const mockHeaders = {
				"content-location": "https://api.onedrive.com/operations/mock-operation-id",
			};
			mockMicrosoftGraphClient.post.mockResolvedValue({ headers: mockHeaders });

			mockMicrosoftGraphClient.get
				.mockResolvedValueOnce({ status: "completed" })
				.mockResolvedValueOnce(mockResponses.createFile);

			await provider.copy("source-id", "root");

			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				parentReference: { id: "root" },
				name: undefined,
			});
		});
	});

	describe("move", () => {
		it("should move file to target parent", async () => {
			mockMicrosoftGraphClient.patch.mockResolvedValue(mockResponses.createFile);

			const result = await provider.move("source-id", "target-parent-id", "new-name");

			expect(result).not.toBeNull();
			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
				name: "new-name",
			});
		});

		it("should move without renaming", async () => {
			mockMicrosoftGraphClient.patch.mockResolvedValue(mockResponses.createFile);

			await provider.move("source-id", "target-parent-id");

			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
			});
		});

		it("should handle root as target parent", async () => {
			mockMicrosoftGraphClient.patch.mockResolvedValue(mockResponses.createFile);

			await provider.move("source-id", "root");

			expect(mockMicrosoftGraphClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "root" },
			});
		});
	});

	describe("getDriveInfo", () => {
		it("should get drive information", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.driveInfo);

			const result = await provider.getDriveInfo();

			expect(result).not.toBeNull();
			expect(result?.totalSpace).toBe(5368709120);
			expect(result?.usedSpace).toBe(1073741824);
			expect(result?.trashSize).toBe(0);
			expect(result?.state).toBe("normal");
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive");
		});

		it("should handle missing quota information", async () => {
			const driveWithoutQuota = { ...mockResponses.driveInfo };
			const { quota: _quota, ...driveWithoutQuotaData } = driveWithoutQuota;
			const finalDriveData = driveWithoutQuotaData;
			mockMicrosoftGraphClient.get.mockResolvedValue(finalDriveData);

			await expect(provider.getDriveInfo()).rejects.toThrow("Drive quota information not available");
		});
	});

	describe("getShareableLink", () => {
		it("should create shareable link with view permission", async () => {
			mockMicrosoftGraphClient.post.mockResolvedValue({});
			mockMicrosoftGraphClient.get.mockResolvedValue({
				webUrl: "https://onedrive.live.com/shared-link",
			});

			const result = await provider.getShareableLink("mock-file-id", "view");

			expect(result).toBe("https://onedrive.live.com/shared-link");
			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				type: "view",
				scope: "anonymous",
				roles: ["read"],
			});
		});

		it("should create shareable link with edit permission", async () => {
			mockMicrosoftGraphClient.post.mockResolvedValue({});
			mockMicrosoftGraphClient.get.mockResolvedValue({
				webUrl: "https://onedrive.live.com/shared-link",
			});

			await provider.getShareableLink("mock-file-id", "edit");

			expect(mockMicrosoftGraphClient.post).toHaveBeenCalledWith({
				type: "view",
				scope: "anonymous",
				roles: ["write"],
			});
		});

		it("should return null when webUrl is not available", async () => {
			mockMicrosoftGraphClient.post.mockResolvedValue({});
			mockMicrosoftGraphClient.get.mockResolvedValue({});

			const result = await provider.getShareableLink("mock-file-id");

			expect(result).toBeNull();
		});
	});

	describe("search", () => {
		it("should search for files", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.searchResults);

			const result = await provider.search("test query");

			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.name).toBe("matching-file.txt");
			expect(mockMicrosoftGraphClient.api).toHaveBeenCalledWith("/me/drive/root/search(q='test query')");
		});

		it("should handle search with options", async () => {
			const options = { pageSize: 50, pageToken: "next-token", orderBy: "lastModifiedDateTime" };
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.searchResults);

			await provider.search("test query", options);

			expect(mockMicrosoftGraphClient.query).toHaveBeenCalledWith({
				$top: 50,
				$skipToken: "next-token",
				$orderby: "lastModifiedDateTime",
			});
		});

		it("should use default search options", async () => {
			mockMicrosoftGraphClient.get.mockResolvedValue(mockResponses.searchResults);

			await provider.search("test query", {});

			expect(mockMicrosoftGraphClient.query).toHaveBeenCalledWith({
				$top: 100,
				$orderby: "name",
			});
		});
	});
});
