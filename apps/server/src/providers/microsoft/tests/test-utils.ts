import { OneDriveProvider } from "../one-drive-provider";
import type { FileMetadata } from "@nimbus/shared";
import { vi } from "vitest";

export const mockMicrosoftGraphClient = {
	api: vi.fn().mockReturnThis(),
	query: vi.fn().mockReturnThis(),
	header: vi.fn().mockReturnThis(),
	post: vi.fn(),
	get: vi.fn(),
	put: vi.fn(),
	patch: vi.fn(),
	delete: vi.fn(),
};

export const mockResponses = {
	createFile: {
		id: "mock-file-id",
		name: "test-file.txt",
		size: 1024,
		file: { mimeType: "text/plain" },
		createdDateTime: "2023-01-01T00:00:00Z",
		lastModifiedDateTime: "2023-01-01T00:00:00Z",
		parentReference: { id: "root" },
		webUrl: "https://onedrive.live.com/test-file",
		"@microsoft.graph.downloadUrl": "https://download.example.com/test-file",
	},

	createFolder: {
		id: "mock-folder-id",
		name: "Test Folder",
		folder: { childCount: 0 },
		size: 0,
		createdDateTime: "2023-01-01T00:00:00Z",
		lastModifiedDateTime: "2023-01-01T00:00:00Z",
		parentReference: { id: "root" },
		webUrl: "https://onedrive.live.com/test-folder",
	},

	listChildren: {
		value: [
			{
				id: "child-1",
				name: "child-file.txt",
				size: 512,
				file: { mimeType: "text/plain" },
				createdDateTime: "2023-01-01T00:00:00Z",
				lastModifiedDateTime: "2023-01-01T00:00:00Z",
				parentReference: { id: "root" },
				webUrl: "https://onedrive.live.com/child-file",
			},
			{
				id: "child-2",
				name: "child-folder",
				folder: { childCount: 0 },
				size: 0,
				createdDateTime: "2023-01-01T00:00:00Z",
				lastModifiedDateTime: "2023-01-01T00:00:00Z",
				parentReference: { id: "root" },
				webUrl: "https://onedrive.live.com/child-folder",
			},
		],
		"@odata.nextLink": null,
	},

	driveInfo: {
		id: "mock-drive-id",
		driveType: "personal",
		owner: { user: { displayName: "Test User" } },
		quota: {
			total: 5368709120, // 5GB
			used: 1073741824, // 1GB
			deleted: 0,
		},
	},

	searchResults: {
		value: [
			{
				id: "search-result-1",
				name: "matching-file.txt",
				size: 256,
				file: { mimeType: "text/plain" },
				createdDateTime: "2023-01-01T00:00:00Z",
				lastModifiedDateTime: "2023-01-01T00:00:00Z",
				parentReference: { id: "root" },
				webUrl: "https://onedrive.live.com/matching-file",
			},
		],
		"@odata.nextLink": null,
	},

	uploadSession: {
		uploadUrl: "https://upload.onedrive.com/session-url",
		expirationDateTime: "2023-01-01T01:00:00Z",
		nextExpectedRanges: ["0-"],
	},

	uploadComplete: {
		id: "large-file-id",
		name: "large-file.bin",
		size: 15728640, // 15MB
		file: {
			mimeType: "application/octet-stream",
			hashes: { sha1Hash: "mock-hash" },
		},
		createdDateTime: "2023-01-01T00:00:00Z",
		lastModifiedDateTime: "2023-01-01T00:00:00Z",
		parentReference: { id: "root" },
		webUrl: "https://onedrive.live.com/large-file",
	},
};

// Helper functions to create test data
export function createFileMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
	return {
		name: "test-file.txt",
		mimeType: "text/plain",
		parentId: "root",
		description: "Test file description",
		...overrides,
	};
}

export function createFolderMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
	return {
		name: "Test Folder",
		mimeType: "application/vnd.microsoft.folder",
		parentId: "root",
		description: "Test folder description",
		...overrides,
	};
}

// Provider creation utilities
export function createProviderWithMockClient(): OneDriveProvider {
	const provider = new OneDriveProvider("mock-access-token");
	(provider as any).client = mockMicrosoftGraphClient;
	return provider;
}

// Mock reset utility
export function resetAllMocks(): void {
	vi.clearAllMocks();

	mockMicrosoftGraphClient.api.mockReturnThis();
	mockMicrosoftGraphClient.query.mockReturnThis();
	mockMicrosoftGraphClient.header.mockReturnThis();
}

// Test data generators
export function generateTestBuffer(size: number = 1024): Buffer {
	return Buffer.alloc(size, "test-data");
}

export function createMockFetchResponse(data: any, status: number = 200): Response {
	const response = new Response(JSON.stringify(data), { status });
	Object.defineProperty(response, "ok", { value: status >= 200 && status < 300 });
	return response;
}
