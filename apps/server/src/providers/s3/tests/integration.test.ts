import {
	cleanupTestBucket,
	cleanupTestFiles,
	createTestS3Provider,
	generateTestFileName,
	setupTestBucket,
} from "./test-utils";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { S3Provider } from "../s3-provider";

// Test data interfaces
interface TestFile {
	id: string;
	name: string;
	size?: number;
	mimeType?: string;
	parentId?: string;
}

interface TestFolder {
	id: string;
	name: string;
	mimeType: string;
}

interface TestEnvironment {
	folder: TestFolder;
	rootFile: TestFile;
	nestedFile: TestFile;
}

/**
 * Test resource manager for handling setup and cleanup
 */
class TestResourceManager {
	private resources: Array<{ id: string }> = [];

	constructor(private s3Provider: S3Provider) {}

	/**
	 * Creates a test folder with a unique name and tracks it for cleanup
	 */
	async createFolder(baseName = "test-folder"): Promise<TestFolder> {
		const name = generateTestFileName(baseName);
		const folder = await this.s3Provider.create({
			name,
			mimeType: "application/vnd.google-apps.folder",
		});
		this.resources.push({ id: folder!.id });
		return folder!;
	}

	/**
	 * Creates a test file with unique name and content and tracks it for cleanup
	 */
	async createFile(baseName = "test-file", content = "Test file content", parentId?: string): Promise<TestFile> {
		const name = generateTestFileName(baseName) + ".txt";
		const file = await this.s3Provider.create(
			{
				name,
				mimeType: "text/plain",
				...(parentId && { parentId }),
			},
			Buffer.from(content)
		);
		this.resources.push({ id: file!.id });
		return file!;
	}

	/**
	 * Sets up a complete test environment with folder and files
	 */
	async setupEnvironment(): Promise<TestEnvironment> {
		const folder = await this.createFolder();
		const rootFile = await this.createFile("root-test", "Root file content");
		const nestedFile = await this.createFile("nested-test", "Nested file content", folder.id);

		return { folder, rootFile, nestedFile };
	}

	/**
	 * Cleans up all tracked resources
	 */
	async cleanup(): Promise<void> {
		const fileIds = this.resources.filter(r => r?.id).map(r => r.id);
		await cleanupTestFiles(this.s3Provider, fileIds);
		this.resources = [];
	}

	/**
	 * Adds an existing resource to be tracked for cleanup
	 */
	trackResource(resource: { id: string }): void {
		this.resources.push(resource);
	}
}

describe("S3Provider Integration Tests", () => {
	const bucketName = generateTestFileName("integration-test-bucket");
	let s3Provider: S3Provider;
	let resourceManager: TestResourceManager;

	beforeAll(async () => {
		await setupTestBucket(bucketName);
		s3Provider = createTestS3Provider(bucketName);
		resourceManager = new TestResourceManager(s3Provider);
	});

	afterAll(async () => {
		await cleanupTestBucket(bucketName);
	});

	describe("Authentication Interface", () => {
		it("should get access token", () => {
			const token = s3Provider.getAccessToken();
			expect(typeof token).toBe("string");
			expect(token.length).toBeGreaterThan(0);
		});

		it("should reject token updates", () => {
			expect(() => {
				s3Provider.setAccessToken("test-token");
			}).toThrow("S3Provider does not support dynamic credential updates");
		});
	});

	describe("Drive Information", () => {
		it("should get drive info successfully", async () => {
			const driveInfo = await s3Provider.getDriveInfo();
			expect(driveInfo).toBeDefined();
			expect(typeof driveInfo).toBe("object");
		});
	});

	describe("File Operations", () => {
		it("should create folders and files successfully", async () => {
			// Create a folder
			const testFolder = await resourceManager.createFolder("create-test-folder");
			expect(testFolder).toBeDefined();
			expect(testFolder.name).toContain("create-test-folder");

			// Create a file in root
			const rootFile = await resourceManager.createFile("create-root-test", "Root file content");
			expect(rootFile).toBeDefined();
			expect(rootFile.name).toContain("create-root-test");

			// Create a file in folder
			const nestedFile = await resourceManager.createFile("create-nested-test", "Nested file content", testFolder.id);
			expect(nestedFile).toBeDefined();
			expect(nestedFile.name).toContain("create-nested-test");
		});

		it("should retrieve files by ID", async () => {
			const rootFile = await resourceManager.createFile("retrieve-test", "Content for retrieval");

			const retrieved = await s3Provider.getById(rootFile.id);
			expect(retrieved).toBeDefined();
			expect(retrieved!.id).toBe(rootFile.id);
			expect(retrieved!.name).toBe(rootFile.name);
		});

		it("should list directory contents", async () => {
			const { folder, rootFile: _rootFile, nestedFile: _nestedFile } = await resourceManager.setupEnvironment();

			const rootListing = await s3Provider.listChildren();
			expect(rootListing).toBeDefined();
			expect(Array.isArray(rootListing.items)).toBe(true);

			const folderListing = await s3Provider.listChildren(folder.id);
			expect(folderListing).toBeDefined();
			expect(Array.isArray(folderListing.items)).toBe(true);
			expect(folderListing.items.length).toBeGreaterThan(0);
		});

		it("should download file content", async () => {
			const testContent = "Content for download test";
			const rootFile = await resourceManager.createFile("download-test", testContent);

			const downloaded = await s3Provider.download(rootFile.id);
			expect(downloaded).toBeDefined();
			if (!downloaded) return;
			expect(downloaded.data.toString()).toBe(testContent);
			expect(downloaded.size).toBeGreaterThan(0);
		});

		it("should update file metadata", async () => {
			const rootFile = await resourceManager.createFile("update-test", "Content for update");

			const newName = generateTestFileName("renamed-test") + ".txt";
			const updatedFile = await s3Provider.update(rootFile.id, {
				name: newName,
			});
			expect(updatedFile).toBeDefined();
			expect(updatedFile!.name).toBe(newName);
		});

		it("should copy files between directories", async () => {
			const { folder, rootFile } = await resourceManager.setupEnvironment();

			const copyName = generateTestFileName("copied-file") + ".txt";
			const copiedFile = await s3Provider.copy(rootFile.id, folder.id, copyName);
			resourceManager.trackResource({ id: copiedFile!.id });
			expect(copiedFile).toBeDefined();
			expect(copiedFile!.name).toBe(copyName);
		});

		it("should move files between directories", async () => {
			const { folder: _folder, nestedFile } = await resourceManager.setupEnvironment();
			const moveName = generateTestFileName("moved-to-root") + ".txt";
			const movedFile = await s3Provider.move(nestedFile.id, "", moveName);
			resourceManager.trackResource({ id: movedFile!.id });
			expect(movedFile).toBeDefined();
			expect(movedFile!.name).toBe(moveName);
		});

		it("should search for files", async () => {
			const searchTerm = generateTestFileName("searchable");
			const _testFile = await resourceManager.createFile(searchTerm, "Searchable content");
			const searchResults = await s3Provider.search(searchTerm);
			expect(searchResults).toBeDefined();
			expect(Array.isArray(searchResults.items)).toBe(true);
			// Note: Search might not always return results immediately in S3
		});
	});

	describe("Shareable Links", () => {
		it("should handle shareable links appropriately", async () => {
			const testManager = new TestResourceManager(s3Provider);
			const testFile = await testManager.createFile("shareable-test", "Content for sharing");
			const shareLink = await s3Provider.getShareableLink(testFile.id);
			// S3 typically returns null for shareable links
			expect(shareLink === null || typeof shareLink === "string").toBe(true);
		});
	});
});
