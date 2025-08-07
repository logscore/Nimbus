import { GoogleDriveProvider } from "../google-drive-provider";
import type { FileMetadata } from "@nimbus/shared";
import { vi } from "vitest";

// Mock Google Drive API client
export const mockGoogleDriveClient = {
	files: {
		create: vi.fn(),
		get: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		list: vi.fn(),
		copy: vi.fn(),
		export: vi.fn(),
	},
	about: {
		get: vi.fn(),
	},
	permissions: {
		create: vi.fn(),
	},
};

// Mock responses
export const mockResponses = {
	createFile: {
		data: {
			id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			name: "test-file.txt",
			mimeType: "text/plain",
			size: "11",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:00:00.000Z",
			parents: ["root"],
			webViewLink: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
			webContentLink: "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
		},
	},
	createFolder: {
		data: {
			id: "1G2s3T4u5V6w7X8y9Z0a1B2c3D4e5F6g7H8i9J0k",
			name: "test-folder",
			mimeType: "application/vnd.google-apps.folder",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:00:00.000Z",
			parents: ["root"],
		},
	},
	getFile: {
		data: {
			id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			name: "test-file.txt",
			mimeType: "text/plain",
			size: "11",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:00:00.000Z",
			parents: ["root"],
		},
	},
	updateFile: {
		data: {
			id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			name: "renamed-file.txt",
			mimeType: "text/plain",
			size: "11",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:30:00.000Z",
			parents: ["root"],
		},
	},
	listFiles: {
		data: {
			files: [
				{
					id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
					name: "test-file.txt",
					mimeType: "text/plain",
					size: "11",
					createdTime: "2023-01-01T12:00:00.000Z",
					modifiedTime: "2023-01-01T12:00:00.000Z",
					parents: ["root"],
				},
				{
					id: "1G2s3T4u5V6w7X8y9Z0a1B2c3D4e5F6g7H8i9J0k",
					name: "test-folder",
					mimeType: "application/vnd.google-apps.folder",
					createdTime: "2023-01-01T12:00:00.000Z",
					modifiedTime: "2023-01-01T12:00:00.000Z",
					parents: ["root"],
				},
			],
			nextPageToken: "next-page-token-123",
		},
	},
	copyFile: {
		data: {
			id: "2CxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			name: "copied-file.txt",
			mimeType: "text/plain",
			size: "11",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:00:00.000Z",
			parents: ["1G2s3T4u5V6w7X8y9Z0a1B2c3D4e5F6g7H8i9J0k"],
		},
	},
	moveFile: {
		data: {
			id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			name: "moved-file.txt",
			mimeType: "text/plain",
			size: "11",
			createdTime: "2023-01-01T12:00:00.000Z",
			modifiedTime: "2023-01-01T12:30:00.000Z",
			parents: ["1G2s3T4u5V6w7X8y9Z0a1B2c3D4e5F6g7H8i9J0k"],
		},
	},
	driveInfo: {
		data: {
			storageQuota: {
				limit: "15000000000",
				usage: "5000000000",
				usageInDriveTrash: "1000000000",
			},
			user: {
				emailAddress: "test@example.com",
				displayName: "Test User",
			},
		},
	},
	shareableLink: {
		data: {
			webViewLink: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
		},
	},
	exportFile: {
		data: Buffer.from("exported file content"),
	},
	downloadFile: {
		data: Buffer.from("test file content"),
	},
	searchResults: {
		data: {
			files: [
				{
					id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
					name: "search-result.txt",
					mimeType: "text/plain",
					size: "20",
					createdTime: "2023-01-01T12:00:00.000Z",
					modifiedTime: "2023-01-01T12:00:00.000Z",
					parents: ["root"],
				},
			],
			nextPageToken: undefined,
		},
	},
};

// Utility functions
export function createFileMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
	return {
		name: "test-file.txt",
		mimeType: "text/plain",
		parentId: "root",
		...overrides,
	};
}

export function createFolderMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
	return {
		name: "test-folder",
		mimeType: "application/vnd.google-apps.folder",
		parentId: "root",
		...overrides,
	};
}

// Reset all mocks
export function resetAllMocks(): void {
	vi.clearAllMocks();
	Object.values(mockGoogleDriveClient.files).forEach(mock => mock.mockReset?.());
	mockGoogleDriveClient.about.get.mockReset?.();
	mockGoogleDriveClient.permissions.create.mockReset?.();
}

// Create provider with mock client
export function createProviderWithMockClient(): GoogleDriveProvider {
	const provider = new GoogleDriveProvider("mock-access-token");
	// Mock the internal drive client
	(provider as any).drive = mockGoogleDriveClient;
	return provider;
}

// Create provider with fresh mock client (isolated)
export function createProviderWithFreshMockClient(): GoogleDriveProvider {
	const provider = new GoogleDriveProvider("mock-access-token");
	const freshMockClient = {
		files: {
			create: vi.fn(),
			get: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			list: vi.fn(),
			copy: vi.fn(),
			export: vi.fn(),
		},
		about: {
			get: vi.fn(),
		},
		permissions: {
			create: vi.fn(),
		},
	};
	(provider as any).drive = freshMockClient;
	return provider;
}

// Restore mock client to provider
export function restoreMockClient(provider: GoogleDriveProvider): void {
	(provider as any).drive = mockGoogleDriveClient;
}
