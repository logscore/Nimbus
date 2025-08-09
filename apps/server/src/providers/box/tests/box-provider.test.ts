import {
	mockBoxClient,
	resetAllMocks,
	createBoxFileItem,
	createBoxFolderItem,
	createBoxUserInfo,
	createFileMetadata,
	mockBoxResponses,
	createProviderWithMockClient,
} from "./test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import { Readable } from "node:stream";

describe("BoxProvider", () => {
	let provider: ReturnType<typeof createProviderWithMockClient>;

	beforeEach(() => {
		resetAllMocks();
		provider = createProviderWithMockClient();
	});

	describe("Constructor", () => {
		it("should create BoxProvider with credentials", () => {
			expect(provider.getAccessToken()).toBe("test-token");
		});
	});

	describe("Authentication Interface", () => {
		it("should get and set access token", () => {
			const newToken = "new-access-token";
			provider.setAccessToken(newToken);
			expect(provider.getAccessToken()).toBe(newToken);
		});
	});

	describe("create", () => {
		it("should create a folder", async () => {
			const folderMetadata = createFileMetadata({
				name: "Test Folder",
				mimeType: "application/x-directory",
				parentId: "0",
			});

			const mockFolder = createBoxFolderItem({
				name: "Test Folder",
				parent: { id: "0" },
			});

			mockBoxClient.folders.create.mockResolvedValueOnce(mockFolder);

			const result = await provider.create(folderMetadata);

			expect(mockBoxClient.folders.create).toHaveBeenCalledWith("0", "Test Folder", { description: "Test file" });
			expect(result).toBeTruthy();
			expect(result?.type).toBe("folder");
			expect(result?.name).toBe("Test Folder");
		});

		it("should create a file without content", async () => {
			const fileMetadata = createFileMetadata();

			await expect(provider.create(fileMetadata)).rejects.toThrow("Content is required for file creation");
		});

		it("should create a small file with content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Buffer.from("Hello, World!");
			const mockFile = createBoxFileItem();

			mockBoxClient.files.uploadFile.mockResolvedValueOnce(mockBoxResponses.fileUpload());

			const result = await provider.create(fileMetadata, content);

			expect(mockBoxClient.files.uploadFile).toHaveBeenCalledWith("0", "test-file.txt", expect.any(Readable), {
				content_type: "text/plain",
				description: "Test file",
			});
			expect(result).toBeTruthy();
			expect(result?.type).toBe("file");
			expect(result?.name).toBe("test-file.txt");
		});

		it("should create a file with stream content", async () => {
			const fileMetadata = createFileMetadata();
			const content = Readable.from("Hello, World!");
			const mockFile = createBoxFileItem();

			mockBoxClient.files.uploadFile.mockResolvedValueOnce(mockBoxResponses.fileUpload());

			const result = await provider.create(fileMetadata, content);

			expect(mockBoxClient.files.uploadFile).toHaveBeenCalledWith("0", "test-file.txt", content, {
				content_type: "text/plain",
				description: "Test file",
			});
			expect(result).toBeTruthy();
			expect(result?.type).toBe("file");
		});

		it("should handle folder creation with custom parent", async () => {
			const folderMetadata = createFileMetadata({
				name: "Subfolder",
				mimeType: "application/vnd.google-apps.folder",
				parentId: "parent123",
			});

			const mockFolder = createBoxFolderItem({
				name: "Subfolder",
				parent: { id: "parent123" },
			});

			mockBoxClient.folders.create.mockResolvedValueOnce(mockFolder);

			const result = await provider.create(folderMetadata);

			expect(mockBoxClient.folders.create).toHaveBeenCalledWith("parent123", "Subfolder", { description: "Test file" });
			expect(result?.parentId).toBe("parent123");
		});

		it("should handle creation errors", async () => {
			const fileMetadata = createFileMetadata();
			const content = Buffer.from("test");
			mockBoxClient.files.uploadFile.mockRejectedValue(new Error("Upload failed"));

			await expect(provider.create(fileMetadata, content)).rejects.toThrow("Upload failed");
		});

		it("should throw error when upload returns no entries", async () => {
			const fileMetadata = createFileMetadata();
			const content = Buffer.from("test");

			mockBoxClient.files.uploadFile.mockResolvedValueOnce({ entries: [] });

			await expect(provider.create(fileMetadata, content)).rejects.toThrow("No file entry returned from Box upload");
		});
	});

	describe("getById", () => {
		it("should get file by ID", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);

			const result = await provider.getById("file123");

			expect(mockBoxClient.files.get).toHaveBeenCalledWith("file123", {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
			});
			expect(result).toBeTruthy();
			expect(result?.id).toBe("file123");
			expect(result?.type).toBe("file");
		});

		it("should get folder by ID when file fetch fails", async () => {
			const mockFolder = createBoxFolderItem();
			mockBoxClient.files.get.mockRejectedValue(new Error("Not a file"));
			mockBoxClient.folders.get.mockResolvedValueOnce(mockFolder);

			const result = await provider.getById("folder123");

			expect(mockBoxClient.files.get).toHaveBeenCalled();
			expect(mockBoxClient.folders.get).toHaveBeenCalledWith("folder123", {
				fields:
					"id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,item_collection",
			});
			expect(result).toBeTruthy();
			expect(result?.id).toBe("folder123");
			expect(result?.type).toBe("folder");
		});

		it("should return null for non-existent file", async () => {
			const error = new Error("Not found") as Error & { statusCode: number };
			error.statusCode = 404;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			const result = await provider.getById("nonexistent");

			expect(result).toBeNull();
		});

		it("should throw error for other failures", async () => {
			const error = new Error("Server error") as Error & { statusCode: number };
			error.statusCode = 500;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			await expect(provider.getById("file123")).rejects.toThrow("Server error");
		});
	});

	describe("update", () => {
		it("should update file metadata", async () => {
			const mockFile = createBoxFileItem();
			const updatedFile = createBoxFileItem({ name: "updated-file.txt" });

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.update.mockResolvedValueOnce(updatedFile);

			const result = await provider.update("file123", {
				name: "updated-file.txt",
				description: "Updated description",
			});

			expect(mockBoxClient.files.update).toHaveBeenCalledWith("file123", {
				name: "updated-file.txt",
				description: "Updated description",
			});
			expect(result?.name).toBe("updated-file.txt");
		});

		it("should update folder metadata", async () => {
			const mockFolder = createBoxFolderItem();
			const updatedFolder = createBoxFolderItem({ name: "updated-folder" });

			mockBoxClient.files.get.mockRejectedValue(new Error("Not a file"));
			mockBoxClient.folders.get.mockResolvedValueOnce(mockFolder);
			mockBoxClient.folders.update.mockResolvedValueOnce(updatedFolder);

			const result = await provider.update("folder123", {
				name: "updated-folder",
			});

			expect(mockBoxClient.folders.update).toHaveBeenCalledWith("folder123", {
				name: "updated-folder",
			});
			expect(result?.name).toBe("updated-folder");
		});

		it("should return null for non-existent file", async () => {
			const error = new Error("Not found") as Error & { statusCode: number };
			error.statusCode = 404;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			const result = await provider.update("nonexistent", { name: "new-name" });

			expect(result).toBeNull();
		});

		it("should handle update errors", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.update.mockRejectedValue(new Error("Update failed"));

			await expect(provider.update("file123", { name: "new-name" })).rejects.toThrow("Update failed");
		});
	});

	describe("delete", () => {
		it("should delete file permanently", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.delete.mockResolvedValueOnce(undefined);

			const result = await provider.delete("file123", true);

			expect(mockBoxClient.files.delete).toHaveBeenCalledWith("file123", true);
			expect(result).toBe(true);
		});

		it("should delete folder permanently", async () => {
			const mockFolder = createBoxFolderItem();
			mockBoxClient.files.get.mockRejectedValue(new Error("Not a file"));
			mockBoxClient.folders.get.mockResolvedValueOnce(mockFolder);
			mockBoxClient.folders.delete.mockResolvedValueOnce(undefined);

			const result = await provider.delete("folder123", true);

			expect(mockBoxClient.folders.delete).toHaveBeenCalledWith("folder123", true);
			expect(result).toBe(true);
		});

		it("should move file to trash (soft delete)", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.delete.mockResolvedValueOnce(undefined);

			const result = await provider.delete("file123", false);

			expect(mockBoxClient.files.delete).toHaveBeenCalledWith("file123", false);
			expect(result).toBe(true);
		});

		it("should throw error for non-existent file", async () => {
			const error = new Error("Not found") as Error & { statusCode: number };
			error.statusCode = 404;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			await expect(provider.delete("nonexistent")).rejects.toThrow("File with id nonexistent not found");
		});

		it("should handle deletion errors", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.delete.mockRejectedValue(new Error("Delete failed"));

			await expect(provider.delete("file123")).rejects.toThrow("Delete failed");
		});
	});

	describe("listChildren", () => {
		it("should list children of root folder", async () => {
			mockBoxClient.folders.getItems.mockResolvedValueOnce(mockBoxResponses.listChildren());

			const result = await provider.listChildren("0");

			expect(mockBoxClient.folders.getItems).toHaveBeenCalledWith("0", {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				limit: 100,
				offset: 0,
			});
			expect(result.items).toHaveLength(2);
			expect(result.items[0]?.type).toBe("file");
			expect(result.items[1]?.type).toBe("folder");
		});

		it("should list children of specific folder", async () => {
			mockBoxClient.folders.getItems.mockResolvedValueOnce(mockBoxResponses.listChildren());

			const result = await provider.listChildren("folder123");

			expect(mockBoxClient.folders.getItems).toHaveBeenCalledWith("folder123", {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				limit: 100,
				offset: 0,
			});
			expect(result.items).toHaveLength(2);
		});

		it("should handle pagination options", async () => {
			mockBoxClient.folders.getItems.mockResolvedValueOnce({
				entries: [createBoxFileItem()],
				total_count: 150,
			});

			const result = await provider.listChildren("0", {
				pageSize: 50,
				pageToken: "50",
			});

			expect(mockBoxClient.folders.getItems).toHaveBeenCalledWith("0", {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				limit: 50,
				offset: 50,
			});
			expect(result.nextPageToken).toBe("100");
		});

		it("should use default options when none provided", async () => {
			mockBoxClient.folders.getItems.mockResolvedValueOnce({
				entries: [createBoxFileItem()],
				total_count: 50,
			});

			const result = await provider.listChildren();

			expect(mockBoxClient.folders.getItems).toHaveBeenCalledWith("0", {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				limit: 100,
				offset: 0,
			});
			expect(result.nextPageToken).toBeUndefined();
		});

		it("should normalize root parentId", async () => {
			mockBoxClient.folders.getItems.mockResolvedValueOnce(mockBoxResponses.listChildren());

			await provider.listChildren("root");

			expect(mockBoxClient.folders.getItems).toHaveBeenCalledWith("0", expect.any(Object));
		});

		it("should handle listing errors", async () => {
			mockBoxClient.folders.getItems.mockRejectedValue(new Error("List failed"));

			await expect(provider.listChildren("0")).rejects.toThrow("List failed");
		});
	});

	describe("download", () => {
		it("should download file successfully", async () => {
			const mockFile = createBoxFileItem({ name: "download.txt", size: "100" });

			const mockStream = new Readable({
				read() {
					this.push("file content");
					this.push(null);
				},
			});

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.getReadStream.mockResolvedValueOnce(mockStream);

			const result = await provider.download("file123");

			expect(mockBoxClient.files.get).toHaveBeenCalledWith("file123", { fields: "name,size" });
			expect(mockBoxClient.files.getReadStream).toHaveBeenCalledWith("file123");
			expect(result).toBeTruthy();
			expect(result?.filename).toBe("download.txt");
			expect(result?.data.toString()).toBe("file content");
			expect(result?.size).toBe(100);
		});

		it("should return null when file not found", async () => {
			mockBoxClient.files.get.mockRejectedValue(new Error("Not found"));

			const result = await provider.download("nonexistent");

			expect(result).toBeNull();
		});

		it("should handle download errors gracefully", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.getReadStream.mockRejectedValue(new Error("Stream failed"));

			const result = await provider.download("file123");

			expect(result).toBeNull();
		});

		it("should use default filename when name is missing", async () => {
			const mockFile = createBoxFileItem({ name: undefined, size: "0" });
			const mockStream = new Readable({
				read() {
					this.push(null);
				},
			});

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.getReadStream.mockResolvedValueOnce(mockStream);

			const result = await provider.download("file123");

			expect(result?.filename).toBe("download");
		});

		it("should calculate size when size is missing", async () => {
			const mockFile = createBoxFileItem({ size: undefined });
			const content = "calculated size content";
			const mockStream = new Readable({
				read() {
					this.push(content);
					this.push(null);
				},
			});

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.getReadStream.mockResolvedValueOnce(mockStream);

			const result = await provider.download("file123");

			expect(result?.size).toBe(content.length);
		});
	});

	describe("downloadStream", () => {
		it("should return file stream", async () => {
			const mockStream = Readable.from("stream content");
			mockBoxClient.files.getReadStream.mockResolvedValueOnce(mockStream);

			const result = await provider.downloadStream("file123");

			expect(mockBoxClient.files.getReadStream).toHaveBeenCalledWith("file123");
			expect(result).toBe(mockStream);
		});

		it("should return null on error", async () => {
			mockBoxClient.files.getReadStream.mockRejectedValue(new Error("Stream failed"));

			const result = await provider.downloadStream("file123");

			expect(result).toBeNull();
		});
	});

	describe("copy", () => {
		it("should copy file to target parent", async () => {
			const mockFile = createBoxFileItem();
			const copiedFile = createBoxFileItem({ name: "Copy of test-file.txt" });

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.copy.mockResolvedValueOnce(copiedFile);

			const result = await provider.copy("file123", "target456");

			expect(mockBoxClient.files.copy).toHaveBeenCalledWith("file123", "target456", {
				name: "Copy of test-file.txt",
			});
			expect(result?.name).toBe("Copy of test-file.txt");
		});

		it("should copy folder to target parent", async () => {
			const mockFolder = createBoxFolderItem();
			const copiedFolder = createBoxFolderItem({ name: "Copy of test-folder" });

			mockBoxClient.files.get.mockRejectedValue(new Error("Not a file"));
			mockBoxClient.folders.get.mockResolvedValueOnce(mockFolder);
			mockBoxClient.folders.copy.mockResolvedValueOnce(copiedFolder);

			const result = await provider.copy("folder123", "target456");

			expect(mockBoxClient.folders.copy).toHaveBeenCalledWith("folder123", "target456", {
				name: "Copy of test-folder",
			});
			expect(result?.name).toBe("Copy of test-folder");
		});

		it("should copy with custom name", async () => {
			const mockFile = createBoxFileItem();
			const copiedFile = createBoxFileItem({ name: "Custom Name.txt" });

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.copy.mockResolvedValueOnce(copiedFile);

			const result = await provider.copy("file123", "target456", "Custom Name.txt");

			expect(mockBoxClient.files.copy).toHaveBeenCalledWith("file123", "target456", {
				name: "Custom Name.txt",
			});
		});

		it("should return null for non-existent source", async () => {
			const error = new Error("Not found") as Error & { statusCode: number };
			error.statusCode = 404;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			const result = await provider.copy("nonexistent", "target456");

			expect(result).toBeNull();
		});

		it("should handle copy errors", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.copy.mockRejectedValue(new Error("Copy failed"));

			await expect(provider.copy("file123", "target456")).rejects.toThrow("Copy failed");
		});
	});

	describe("move", () => {
		it("should move file to target parent", async () => {
			const mockFile = createBoxFileItem();
			const movedFile = createBoxFileItem({ parent: { id: "target456" } });

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.update.mockResolvedValueOnce(movedFile);

			const result = await provider.move("file123", "target456");

			expect(mockBoxClient.files.update).toHaveBeenCalledWith("file123", {
				parent: { id: "target456" },
			});
			expect(result?.parentId).toBe("target456");
		});

		it("should move folder to target parent", async () => {
			const mockFolder = createBoxFolderItem();
			const movedFolder = createBoxFolderItem({ parent: { id: "target456" } });

			mockBoxClient.files.get.mockRejectedValue(new Error("Not a file"));
			mockBoxClient.folders.get.mockResolvedValueOnce(mockFolder);
			mockBoxClient.folders.update.mockResolvedValueOnce(movedFolder);

			const result = await provider.move("folder123", "target456");

			expect(mockBoxClient.folders.update).toHaveBeenCalledWith("folder123", {
				parent: { id: "target456" },
			});
		});

		it("should move with renaming", async () => {
			const mockFile = createBoxFileItem();
			const movedFile = createBoxFileItem({
				name: "new-name.txt",
				parent: { id: "target456" },
			});

			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.update.mockResolvedValueOnce(movedFile);

			const result = await provider.move("file123", "target456", "new-name.txt");

			expect(mockBoxClient.files.update).toHaveBeenCalledWith("file123", {
				parent: { id: "target456" },
				name: "new-name.txt",
			});
		});

		it("should return null for non-existent source", async () => {
			const error = new Error("Not found") as Error & { statusCode: number };
			error.statusCode = 404;
			mockBoxClient.files.get.mockRejectedValue(error);
			mockBoxClient.folders.get.mockRejectedValue(error);

			const result = await provider.move("nonexistent", "target456");

			expect(result).toBeNull();
		});

		it("should handle move errors", async () => {
			const mockFile = createBoxFileItem();
			mockBoxClient.files.get.mockResolvedValueOnce(mockFile);
			mockBoxClient.files.update.mockRejectedValue(new Error("Move failed"));

			await expect(provider.move("file123", "target456")).rejects.toThrow("Move failed");
		});
	});

	describe("getDriveInfo", () => {
		it("should get drive information", async () => {
			const mockUser = createBoxUserInfo();
			mockBoxClient.users.get.mockResolvedValueOnce(mockUser);

			const result = await provider.getDriveInfo();

			expect(mockBoxClient.users.get).toHaveBeenCalledWith("me", {
				fields: "space_amount,space_used",
			});
			expect(result).toBeTruthy();
			expect(result?.totalSpace).toBe(10737418240);
			expect(result?.usedSpace).toBe(1073741824);
			expect(result?.trashSize).toBe(0);
		});

		it("should return null on error", async () => {
			mockBoxClient.users.get.mockRejectedValue(new Error("User info failed"));

			const result = await provider.getDriveInfo();

			expect(result).toBeNull();
		});

		it("should handle missing space info", async () => {
			const mockUser = createBoxUserInfo({
				space_amount: undefined,
				space_used: undefined,
			});
			mockBoxClient.users.get.mockResolvedValueOnce(mockUser);

			const result = await provider.getDriveInfo();

			expect(result?.totalSpace).toBe(0);
			expect(result?.usedSpace).toBe(0);
		});
	});

	describe("getShareableLink", () => {
		it("should create shareable link with view permission", async () => {
			const mockFile = createBoxFileItem({
				shared_link: { url: "https://app.box.com/s/view123" },
			});
			mockBoxClient.files.update.mockResolvedValueOnce(mockFile);

			const result = await provider.getShareableLink("file123", "view");

			expect(mockBoxClient.files.update).toHaveBeenCalledWith("file123", {
				shared_link: {
					access: "open",
					permissions: {
						can_download: true,
						can_preview: true,
						can_edit: false,
					},
				},
			});
			expect(result).toBe("https://app.box.com/s/view123");
		});

		it("should create shareable link with edit permission", async () => {
			const mockFile = createBoxFileItem({
				shared_link: { url: "https://app.box.com/s/edit123" },
			});
			mockBoxClient.files.update.mockResolvedValueOnce(mockFile);

			const result = await provider.getShareableLink("file123", "edit");

			expect(mockBoxClient.files.update).toHaveBeenCalledWith("file123", {
				shared_link: {
					access: "open",
					permissions: {
						can_download: true,
						can_preview: true,
						can_edit: true,
					},
				},
			});
		});

		it("should return null when shared link is not available", async () => {
			const mockFile = createBoxFileItem({ shared_link: undefined });
			mockBoxClient.files.update.mockResolvedValueOnce(mockFile);

			const result = await provider.getShareableLink("file123");

			expect(result).toBeNull();
		});

		it("should handle errors", async () => {
			mockBoxClient.files.update.mockRejectedValue(new Error("Link creation failed"));

			const result = await provider.getShareableLink("file123");

			expect(result).toBeNull();
		});
	});

	describe("search", () => {
		it("should search for files", async () => {
			mockBoxClient.search.query.mockResolvedValueOnce(mockBoxResponses.searchResults());

			const result = await provider.search("test query");

			expect(mockBoxClient.search.query).toHaveBeenCalledWith("test query", {
				type: "file,folder",
				limit: 100,
				offset: 0,
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
			});
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.name).toBe("search-result.txt");
		});

		it("should search with options", async () => {
			mockBoxClient.search.query.mockResolvedValueOnce({
				entries: [createBoxFileItem()],
				total_count: 75,
			});

			const result = await provider.search("query", {
				pageSize: 25,
				pageToken: "25",
			});

			expect(mockBoxClient.search.query).toHaveBeenCalledWith("query", {
				type: "file,folder",
				limit: 25,
				offset: 25,
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
			});
			expect(result.nextPageToken).toBe("50");
		});

		it("should use default search options", async () => {
			mockBoxClient.search.query.mockResolvedValueOnce({
				entries: [createBoxFileItem()],
				total_count: 10,
			});

			const result = await provider.search("query");

			expect(mockBoxClient.search.query).toHaveBeenCalledWith("query", {
				type: "file,folder",
				limit: 100,
				offset: 0,
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
			});
			expect(result.nextPageToken).toBeUndefined();
		});

		it("should handle search errors", async () => {
			mockBoxClient.search.query.mockRejectedValue(new Error("Search failed"));

			await expect(provider.search("query")).rejects.toThrow("Search failed");
		});
	});
});
