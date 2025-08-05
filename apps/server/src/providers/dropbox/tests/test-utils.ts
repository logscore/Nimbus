import { DropboxProvider } from "../dropbox-provider";
import type { FileMetadata } from "@nimbus/shared";
import { vi } from "vitest";

// Mock Dropbox client responses
export const mockDropboxFile = {
	".tag": "file" as const,
	id: "id:test-file-id",
	name: "test-file.txt",
	path_lower: "/test-file.txt",
	path_display: "/test-file.txt",
	size: 11,
	client_modified: "2023-01-01T12:00:00Z",
	server_modified: "2023-01-01T12:00:00Z",
	content_hash: "abc123",
};

export const mockDropboxFolder = {
	".tag": "folder" as const,
	id: "id:test-folder-id",
	name: "test-folder",
	path_lower: "/test-folder",
	path_display: "/test-folder",
};

export const mockDropboxClient = {
	filesCreateFolderV2: vi.fn(),
	filesUpload: vi.fn(),
	filesGetMetadata: vi.fn(),
	filesMoveV2: vi.fn(),
	filesDeleteV2: vi.fn(),
	filesListFolder: vi.fn(),
	filesListFolderContinue: vi.fn(),
	filesDownload: vi.fn(),
	filesCopyV2: vi.fn(),
	usersGetSpaceUsage: vi.fn(),
	sharingCreateSharedLinkWithSettings: vi.fn(),
	filesSearchV2: vi.fn(),
};

export function createMockDropboxProvider(): DropboxProvider {
	const provider = new DropboxProvider("mock-access-token");
	// Replace the client with our mock
	(provider as any).client = mockDropboxClient;
	return provider;
}

export function createTestFileMetadata(overrides: Partial<FileMetadata> = {}) {
	return {
		name: "test-file.txt",
		mimeType: "text/plain",
		parentId: "",
		...overrides,
	};
}

export function createTestFolderMetadata(overrides: Partial<FileMetadata> = {}) {
	return {
		name: "test-folder",
		mimeType: "application/x-directory",
		parentId: "",
		...overrides,
	};
}

export function resetAllMocks() {
	Object.values(mockDropboxClient).forEach(mock => mock.mockReset());
}

// Mock successful responses
export const mockResponses = {
	createFolder: {
		result: {
			metadata: mockDropboxFolder,
		},
	},
	uploadFile: {
		result: mockDropboxFile,
	},
	getMetadata: {
		result: mockDropboxFile,
	},
	moveFile: {
		result: {
			metadata: mockDropboxFile,
		},
	},
	listFolder: {
		result: {
			entries: [mockDropboxFile, mockDropboxFolder],
			has_more: true,
			cursor: "cursor-123",
		},
	},
	download: {
		result: {
			name: "test-file.txt",
			size: 11,
			fileBinary: Buffer.from("test content"),
		},
	},
	copy: {
		result: {
			metadata: mockDropboxFile,
		},
	},
	spaceUsage: {
		result: {
			used: 1000000,
			allocation: {
				".tag": "individual",
				allocated: 2000000000,
			},
		},
	},
	shareableLink: {
		result: {
			url: "https://dropbox.com/s/test-link",
		},
	},
	search: {
		result: {
			matches: [
				{
					metadata: {
						".tag": "metadata",
						metadata: mockDropboxFile,
					},
				},
			],
			has_more: true,
			cursor: "search-cursor",
		},
	},
};
