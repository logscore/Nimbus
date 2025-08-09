import {
	createFileMetadata,
	createFolderMetadata,
	createProviderWithMockClient,
	createFreshMockClient,
	generateTestBuffer,
	mockResponses,
	cleanupAllMocks,
	type MockMicrosoftGraphClient,
} from "./test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OneDriveProvider } from "../one-drive-provider";
import { Readable } from "node:stream";

describe("OneDriveProvider", () => {
	let provider: OneDriveProvider;
	let mockClient: MockMicrosoftGraphClient;

	beforeEach(() => {
		// Aggressively clean up before each test
		cleanupAllMocks();

		// Create fresh mock client for each test to ensure complete isolation
		mockClient = createFreshMockClient();
		provider = createProviderWithMockClient(mockClient);

		// Explicitly reset all mock implementations to ensure clean state
		mockClient.api.mockClear();
		mockClient.query.mockClear();
		mockClient.header.mockClear();
		mockClient.post.mockClear();
		mockClient.get.mockClear();
		mockClient.put.mockClear();
		mockClient.patch.mockClear();
		mockClient.delete.mockClear();

		// Ensure chaining methods return the mock client
		mockClient.api.mockReturnValue(mockClient);
		mockClient.query.mockReturnValue(mockClient);
		mockClient.header.mockReturnValue(mockClient);
	});

	afterEach(() => {
		// Clean up all mocks after each test to prevent interference
		cleanupAllMocks();
	});

	describe("Constructor", () => {
		it("should create OneDriveProvider with access token", () => {
			const oneDriveProvider = createProviderWithMockClient();
			expect(oneDriveProvider).toBeInstanceOf(OneDriveProvider);
			expect(oneDriveProvider.getAccessToken()).toBe("mock-access-token");
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
			mockClient.post.mockResolvedValueOnce(mockResponses.createFolder);

			const result = await provider.create(folderMetadata);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Test Folder");
			expect(result?.type).toBe("folder");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/root/children");
			expect(mockClient.post).toHaveBeenCalledWith({
				name: "Test Folder",
				folder: {},
				file: undefined,
				description: "Test folder description",
			});
		});

		it("should create a file without content", async () => {
			const fileMetadata = createFileMetadata();
			mockClient.post.mockResolvedValueOnce(mockResponses.createFile);

			const result = await provider.create(fileMetadata);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("test-file.txt");
			expect(result?.type).toBe("file");
			expect(mockClient.post).toHaveBeenCalled();
		});

		it("should create a small file with content", async () => {
			// Create completely isolated test instance
			const isolatedMockClient = createFreshMockClient();
			const isolatedProvider = createProviderWithMockClient(isolatedMockClient);
			
			const fileMetadata = createFileMetadata();
			const content = generateTestBuffer(1024); // 1KB - small file
			isolatedMockClient.put.mockResolvedValueOnce(mockResponses.createFile);

			const result = await isolatedProvider.create(fileMetadata, content);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("test-file.txt");
			expect(isolatedMockClient.put).toHaveBeenCalled();
		});

		it("should create a large file with chunked upload", async () => {
			// Create completely isolated test instance
			const isolatedMockClient = createFreshMockClient();
			const isolatedProvider = createProviderWithMockClient(isolatedMockClient);
			
			const fileMetadata = createFileMetadata({ name: "large-file.bin" });
			const largeContent = generateTestBuffer(15 * 1024 * 1024); // 15MB - large file

			// Mock upload session creation
			isolatedMockClient.post.mockResolvedValueOnce(mockResponses.uploadSession);

			// Mock chunk uploads (multiple PUT calls for chunks)
			isolatedMockClient.put.mockResolvedValue({});

			// Mock final get requests - first returns upload status check, second returns the final item
			isolatedMockClient.get
				.mockResolvedValueOnce({ id: "large-file-id", file: { hashes: { sha1Hash: "mock-hash" } } }) // upload completion check with ID
				.mockResolvedValueOnce(mockResponses.uploadComplete); // final item retrieval

			const result = await isolatedProvider.create(fileMetadata, largeContent);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("large-file.bin");
			expect(isolatedMockClient.post).toHaveBeenCalledWith({
				item: { name: "large-file.bin" },
			});
		});

		it("should handle folder creation with custom parent", async () => {
			const folderMetadata = createFolderMetadata({ parentId: "custom-parent-id" });
			mockClient.post.mockResolvedValueOnce(mockResponses.createFolder);

			await provider.create(folderMetadata);

			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/custom-parent-id/children");
		});

		it("should handle stream content for small files", async () => {
			const fileMetadata = createFileMetadata();
			const stream = new Readable({
				read() {
					this.push("test content");
					this.push(null);
				},
			});

			// Mock for small file upload - put returns the created item directly
			mockClient.put.mockResolvedValueOnce(mockResponses.createFile);

			const result = await provider.create(fileMetadata, stream);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("test-file.txt");
		});

		it("should handle creation errors", async () => {
			// Create completely isolated test instance
			const isolatedMockClient = createFreshMockClient();
			const isolatedProvider = createProviderWithMockClient(isolatedMockClient);
			
			const fileMetadata = createFileMetadata();
			isolatedMockClient.post.mockRejectedValueOnce(new Error("Creation failed"));

			await expect(isolatedProvider.create(fileMetadata)).rejects.toThrow("Creation failed");
		});
	});

	describe("getById", () => {
		it("should get file by ID", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.createFile);

			const result = await provider.getById("mock-file-id");

			expect(result).not.toBeNull();
			expect(result?.id).toBe("mock-file-id");
			expect(result?.name).toBe("test-file.txt");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id");
		});

		it("should return null for non-existent file", async () => {
			const error = new Error("Not found");
			(error as any).statusCode = 404;
			mockClient.get.mockRejectedValueOnce(error);

			const result = await provider.getById("non-existent-id");

			expect(result).toBeNull();
		});

		it("should throw error for other failures", async () => {
			mockClient.get.mockRejectedValueOnce(new Error("Server error"));

			await expect(provider.getById("mock-file-id")).rejects.toThrow("Server error");
		});
	});

	describe("update", () => {
		it("should update file metadata", async () => {
			const updatedData = { name: "updated-file.txt", description: "Updated description" };
			mockClient.patch.mockResolvedValueOnce({
				...mockResponses.createFile,
				...updatedData,
			});

			const result = await provider.update("mock-file-id", updatedData);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("updated-file.txt");
			expect(mockClient.patch).toHaveBeenCalledWith({
				name: "updated-file.txt",
				description: "Updated description",
			});
		});

		it("should move file to different parent", async () => {
			const updateData = { parentId: "new-parent-id" };
			mockClient.patch
				.mockResolvedValueOnce({}) // parent change
				.mockResolvedValueOnce(mockResponses.createFile); // final update

			const result = await provider.update("mock-file-id", updateData);

			expect(result).not.toBeNull();
			expect(mockClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "new-parent-id" },
			});
		});

		it("should handle root parent ID correctly", async () => {
			// Create completely isolated test instance
			const isolatedMockClient = createFreshMockClient();
			const isolatedProvider = createProviderWithMockClient(isolatedMockClient);
			
			const updateData = { parentId: "root" };
			isolatedMockClient.patch
				.mockResolvedValueOnce({}) // parent change
				.mockResolvedValueOnce(mockResponses.createFile); // final update

			await isolatedProvider.update("mock-file-id", updateData);

			expect(isolatedMockClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "root" },
			});
		});
	});

	describe("delete", () => {
		it("should delete file permanently", async () => {
			mockClient.delete.mockResolvedValueOnce(undefined);

			const result = await provider.delete("mock-file-id", true);

			expect(result).toBe(true);
			expect(mockClient.delete).toHaveBeenCalled();
		});

		it("should move file to trash (soft delete)", async () => {
			mockClient.patch.mockResolvedValueOnce(undefined);

			const result = await provider.delete("mock-file-id", false);

			expect(result).toBe(true);
			expect(mockClient.patch).toHaveBeenCalledWith({
				deleted: {},
			});
		});

		it("should return false for non-existent file", async () => {
			const error = new Error("Not found");
			(error as any).statusCode = 404;
			mockClient.delete.mockRejectedValue(error);

			const result = await provider.delete("non-existent-id", true);

			expect(result).toBe(false);
		});

		it("should throw error for other failures", async () => {
			mockClient.delete.mockRejectedValue(new Error("Server error"));

			await expect(provider.delete("mock-file-id", true)).rejects.toThrow("Server error");
		});
	});

	describe("listChildren", () => {
		it("should list children of root folder", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.listChildren);

			const result = await provider.listChildren("root");

			expect(result.items).toHaveLength(2);
			expect(result.items[0]?.name).toBe("child-file.txt");
			expect(result.items[1]?.name).toBe("child-folder");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/root/children");
		});

		it("should list children of specific folder", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.listChildren);

			const result = await provider.listChildren("folder-id");

			expect(result.items).toHaveLength(2);
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/folder-id/children");
		});

		it("should handle pagination options", async () => {
			const options = { pageSize: 50, pageToken: "next-token", orderBy: "lastModifiedDateTime" };
			mockClient.get.mockResolvedValueOnce(mockResponses.listChildren);

			await provider.listChildren("root", options);

			expect(mockClient.query).toHaveBeenCalledWith({
				$top: 50,
				$orderby: "lastModifiedDateTime",
				$skipToken: "next-token",
			});
		});

		it("should use default options when none provided", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.listChildren);

			await provider.listChildren("root", {});

			expect(mockClient.query).toHaveBeenCalledWith({
				$top: 100,
				$orderby: "name",
			});
		});
	});

	describe("download", () => {
		let originalFetch: any;

		beforeEach(() => {
			// Save original fetch and mock it
			originalFetch = global.fetch;
			global.fetch = vi.fn();
		});

		afterEach(() => {
			// Restore original fetch
			global.fetch = originalFetch;
		});

		it("should download file successfully", async () => {
			const downloadMockClient = createFreshMockClient();
			const testProvider = new OneDriveProvider("test-token", downloadMockClient as any);

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
			downloadMockClient.get.mockResolvedValue(rawDriveItem);

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
			mockClient.get.mockResolvedValueOnce(null);

			const result = await provider.download("non-existent-id");

			expect(result).toBeNull();
		});

		it("should return null when download URL not available", async () => {
			const fileWithoutDownloadUrl = { ...mockResponses.createFile };
			delete (fileWithoutDownloadUrl as any)["@microsoft.graph.downloadUrl"];

			mockClient.get.mockResolvedValueOnce(fileWithoutDownloadUrl);

			const result = await provider.download("mock-file-id");

			expect(result).toBeNull();
		});

		it("should handle download errors gracefully", async () => {
			const fileWithDownloadUrl = {
				...mockResponses.createFile,
				"@microsoft.graph.downloadUrl": "https://download.example.com/test-file",
			};

			mockClient.get.mockResolvedValueOnce(fileWithDownloadUrl);

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
			const downloadMockClient = createFreshMockClient();
			const testProvider = new OneDriveProvider("test-token", downloadMockClient as any);

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

			downloadMockClient.get.mockResolvedValue(rawDriveItem);
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
			mockClient.post.mockResolvedValueOnce({ headers: mockHeaders });

			// Mock async operation completion
			mockClient.get
				.mockResolvedValueOnce({ status: "completed" }) // operation status
				.mockResolvedValueOnce(mockResponses.createFile); // copied item

			const result = await provider.copy("source-id", "target-parent-id", "new-name");

			expect(result).not.toBeNull();
			expect(mockClient.post).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
				name: "new-name",
			});
		});

		it("should handle root as target parent", async () => {
			const mockHeaders = {
				"content-location": "https://api.onedrive.com/operations/mock-operation-id",
			};
			mockClient.post.mockResolvedValueOnce({ headers: mockHeaders });

			mockClient.get.mockResolvedValueOnce({ status: "completed" }).mockResolvedValueOnce(mockResponses.createFile);

			await provider.copy("source-id", "root");

			expect(mockClient.post).toHaveBeenCalledWith({
				parentReference: { id: "root" },
				name: undefined,
			});
		});
	});

	describe("move", () => {
		it("should move file to target parent", async () => {
			mockClient.patch.mockResolvedValueOnce(mockResponses.createFile);

			const result = await provider.move("source-id", "target-parent-id", "new-name");

			expect(result).not.toBeNull();
			expect(mockClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
				name: "new-name",
			});
		});

		it("should move without renaming", async () => {
			mockClient.patch.mockResolvedValueOnce(mockResponses.createFile);

			await provider.move("source-id", "target-parent-id");

			expect(mockClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "target-parent-id" },
			});
		});

		it("should handle root as target parent", async () => {
			mockClient.patch.mockResolvedValueOnce(mockResponses.createFile);

			await provider.move("source-id", "root");

			expect(mockClient.patch).toHaveBeenCalledWith({
				parentReference: { id: "root" },
			});
		});
	});

	describe("getDriveInfo", () => {
		it("should get drive information", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.driveInfo);

			const result = await provider.getDriveInfo();

			expect(result).not.toBeNull();
			expect(result?.totalSpace).toBe(5368709120);
			expect(result?.usedSpace).toBe(1073741824);
			expect(result?.trashSize).toBe(0);
			expect(result?.state).toBe("normal");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive");
		});

		it("should handle missing quota information", async () => {
			const driveWithoutQuota = { ...mockResponses.driveInfo };
			const { quota: _quota, ...driveWithoutQuotaData } = driveWithoutQuota;
			const finalDriveData = driveWithoutQuotaData;
			mockClient.get.mockResolvedValueOnce(finalDriveData);

			await expect(provider.getDriveInfo()).rejects.toThrow("Drive quota information not available");
		});
	});

	describe("getShareableLink", () => {
		it("should create shareable link with view permission", async () => {
			// Explicit mock setup for this test
			mockClient.post.mockResolvedValueOnce({});
			mockClient.get.mockResolvedValueOnce({
				webUrl: "https://onedrive.live.com/shared-link",
			});

			const result = await provider.getShareableLink("mock-file-id", "view");

			expect(result).toBe("https://onedrive.live.com/shared-link");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id/createLink");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id?select=webUrl");
			expect(mockClient.post).toHaveBeenCalledWith({
				type: "view",
				scope: "anonymous",
				roles: ["read"],
			});
		});

		it("should create shareable link with edit permission", async () => {
			// Mock setup for this test - no manual reset needed with fresh clients

			// Explicit mock setup for this test
			mockClient.post.mockResolvedValueOnce({});
			mockClient.get.mockResolvedValueOnce({
				webUrl: "https://onedrive.live.com/shared-link",
			});

			const result = await provider.getShareableLink("mock-file-id", "edit");

			expect(result).toBe("https://onedrive.live.com/shared-link");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id/createLink");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/items/mock-file-id?select=webUrl");
			expect(mockClient.post).toHaveBeenCalledWith({
				type: "view",
				scope: "anonymous",
				roles: ["write"],
			});
		});

		it("should return null when webUrl is not available", async () => {
			// Explicit mock setup for this test
			mockClient.post.mockResolvedValueOnce({});
			mockClient.get.mockResolvedValueOnce({});

			const result = await provider.getShareableLink("mock-file-id");

			expect(result).toBeNull();
		});
	});

	describe("search", () => {
		it("should search for files", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.searchResults);

			const result = await provider.search("test query");

			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.name).toBe("matching-file.txt");
			expect(mockClient.api).toHaveBeenCalledWith("/me/drive/root/search(q='test query')");
		});

		it("should handle search with options", async () => {
			const options = { pageSize: 50, pageToken: "next-token", orderBy: "lastModifiedDateTime" };
			mockClient.get.mockResolvedValueOnce(mockResponses.searchResults);

			await provider.search("test query", options);

			expect(mockClient.query).toHaveBeenCalledWith({
				$top: 50,
				$skipToken: "next-token",
				$orderby: "lastModifiedDateTime",
			});
		});

		it("should use default search options", async () => {
			mockClient.get.mockResolvedValueOnce(mockResponses.searchResults);

			await provider.search("test query", {});

			expect(mockClient.query).toHaveBeenCalledWith({
				$top: 100,
				$orderby: "name",
			});
		});
	});
});
