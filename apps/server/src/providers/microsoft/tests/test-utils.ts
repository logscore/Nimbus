import { OneDriveProvider } from "../one-drive-provider";
import type { FileMetadata } from "@nimbus/shared";
import { vi, type MockedFunction } from "vitest";

// Mock Microsoft Graph Client Interface
export interface MockMicrosoftGraphClient {
	api: MockedFunction<any>;
	query: MockedFunction<any>;
	header: MockedFunction<any>;
	post: MockedFunction<any>;
	get: MockedFunction<any>;
	put: MockedFunction<any>;
	patch: MockedFunction<any>;
	delete: MockedFunction<any>;
}

// Factory function to create fresh mock client for each test
export function createFreshMockClient(): MockMicrosoftGraphClient {
	const mockClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi.fn(),
		get: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	};

	// Ensure chaining methods return the mock client
	mockClient.api.mockReturnValue(mockClient);
	mockClient.query.mockReturnValue(mockClient);
	mockClient.header.mockReturnValue(mockClient);

	return mockClient;
}

// Helper to wrap DriveItem responses in proper HTTP response format
export function createMockHttpResponse(data: any, status = 200) {
	return {
		status,
		ok: status >= 200 && status < 300,
		statusText: status === 200 ? "OK" : "Error",
		headers: new Map(),
		...data, // The actual DriveItem data
	};
}

// Legacy export for backwards compatibility (will be deprecated)
export const mockMicrosoftGraphClient = createFreshMockClient();

// Mock responses for OneDrive operations
export const mockResponses = {
	// File creation response
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

	// Folder creation response
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

	// List children response
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

	// Drive info response
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

	// Search results response
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

	// Upload session response
	uploadSession: {
		uploadUrl: "https://upload.onedrive.com/session-url",
		expirationDateTime: "2023-01-01T01:00:00Z",
		nextExpectedRanges: ["0-"],
	},

	// Large file upload completion response
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

// Provider creation utilities with proper isolation
export function createProviderWithMockClient(mockClient?: MockMicrosoftGraphClient): OneDriveProvider {
	const client = mockClient || createFreshMockClient();
	return new OneDriveProvider("mock-access-token", client as any);
}

// Legacy function for backwards compatibility (deprecated)
export function createProviderWithMockClient_Legacy(): OneDriveProvider {
	return new OneDriveProvider("mock-access-token", mockMicrosoftGraphClient as any);
}

// Global mock cleanup utility for afterEach hooks
export function cleanupAllMocks(): void {
	vi.clearAllMocks();
}

// Legacy reset function (deprecated - use cleanupAllMocks instead)
export function resetAllMocks(): void {
	vi.clearAllMocks();

	// Reset mock implementations to default behavior
	mockMicrosoftGraphClient.api.mockReturnThis();
	mockMicrosoftGraphClient.query.mockReturnThis();
	mockMicrosoftGraphClient.header.mockReturnThis();

	// Reset all mock functions to avoid interference between tests
	mockMicrosoftGraphClient.post.mockReset();
	mockMicrosoftGraphClient.get.mockReset();
	mockMicrosoftGraphClient.put.mockReset();
	mockMicrosoftGraphClient.patch.mockReset();
	mockMicrosoftGraphClient.delete.mockReset();
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
