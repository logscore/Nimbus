import { BoxProvider } from "../box-provider";
import type { File } from "@nimbus/shared";
import { vi } from "vitest";

export const mockBoxClient = {
	files: {
		get: vi.fn(),
		uploadFile: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		copy: vi.fn(),
		getReadStream: vi.fn(),
	},
	folders: {
		get: vi.fn(),
		create: vi.fn(),
		getItems: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		copy: vi.fn(),
	},
	users: {
		get: vi.fn(),
	},
	search: {
		query: vi.fn(),
	},
};

export const mockBoxSDK = {
	getBasicClient: vi.fn(() => mockBoxClient),
};

export const MockBoxSDK = vi.fn(() => mockBoxSDK);
export const createProviderWithMockClient = (
	accessToken = "test-token",
	clientId = "test-client",
	clientSecret = "test-secret"
) => {
	return new BoxProvider(accessToken, clientId, clientSecret, mockBoxClient as any);
};

export const createProviderWithFreshMockClient = (
	mockClient: any,
	accessToken = "test-token",
	clientId = "test-client",
	clientSecret = "test-secret"
) => {
	return new BoxProvider(accessToken, clientId, clientSecret, mockClient);
};
export const createBoxFileItem = (overrides: Record<string, any> = {}) => ({
	id: "file123",
	name: "test-file.txt",
	type: "file" as const,
	size: "1024",
	parent: { id: "0" },
	created_at: "2024-01-01T00:00:00Z",
	modified_at: "2024-01-01T00:00:00Z",
	content_created_at: "2024-01-01T00:00:00Z",
	content_modified_at: "2024-01-01T00:00:00Z",
	extension: "txt",
	shared_link: {
		url: "https://app.box.com/s/shared123",
	},
	...overrides,
});

export const createBoxFolderItem = (overrides: Record<string, any> = {}) => ({
	id: "folder123",
	name: "test-folder",
	type: "folder" as const,
	parent: { id: "0" },
	created_at: "2024-01-01T00:00:00Z",
	modified_at: "2024-01-01T00:00:00Z",
	...overrides,
});

export const createBoxUserInfo = (overrides: Record<string, any> = {}) => ({
	space_amount: 10737418240, // 10GB
	space_used: 1073741824, // 1GB
	...overrides,
});

export const createFileMetadata = (overrides: Record<string, any> = {}) => ({
	name: "test-file.txt",
	mimeType: "text/plain",
	description: "Test file",
	parentId: "0",
	...overrides,
});

export const mockBoxResponses = {
	fileUpload: (fileItem: any = {}) => ({
		entries: [createBoxFileItem(fileItem)],
	}),
	folderCreate: (folderItem: any = {}) => createBoxFolderItem(folderItem),
	listChildren: (items: any[] = [], totalCount = 0) => ({
		entries: items.length ? items : [createBoxFileItem(), createBoxFolderItem()],
		total_count: totalCount || items.length || 2,
	}),
	searchResults: (items: any[] = [], totalCount = 0) => ({
		entries: items.length ? items : [createBoxFileItem({ name: "search-result.txt" })],
		total_count: totalCount || items.length || 1,
	}),
	userInfo: (userInfo: any = {}) => createBoxUserInfo(userInfo),
	fileGet: (fileItem: any = {}) => createBoxFileItem(fileItem),
	folderGet: (folderItem: any = {}) => createBoxFolderItem(folderItem),
};

export const createTestFileStructure = (): File[] => [
	{
		id: "file1",
		name: "document.pdf",
		type: "file",
		mimeType: "application/pdf",
		size: 2048,
		parentId: "0",
		createdTime: "2024-01-01T00:00:00Z",
		modifiedTime: "2024-01-01T00:00:00Z",
	},
	{
		id: "folder1",
		name: "Documents",
		type: "folder",
		mimeType: "application/x-directory",
		size: 0,
		parentId: "0",
		createdTime: "2024-01-01T00:00:00Z",
		modifiedTime: "2024-01-01T00:00:00Z",
	},
	{
		id: "file2",
		name: "image.jpg",
		type: "file",
		mimeType: "image/jpeg",
		size: 4096,
		parentId: "folder1",
		createdTime: "2024-01-01T00:00:00Z",
		modifiedTime: "2024-01-01T00:00:00Z",
	},
];

export const createFreshMockBoxClient = () => {
	return {
		files: {
			get: vi.fn(),
			uploadFile: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			copy: vi.fn(),
			getReadStream: vi.fn(),
		},
		folders: {
			get: vi.fn(),
			create: vi.fn(),
			getItems: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			copy: vi.fn(),
		},
		users: {
			get: vi.fn(),
		},
		search: {
			query: vi.fn(),
		},
	};
};

export const resetAllMocks = () => {
	vi.clearAllMocks();
	Object.values(mockBoxClient.files).forEach(mock => mock.mockReset());
	Object.values(mockBoxClient.folders).forEach(mock => mock.mockReset());
	Object.values(mockBoxClient.users).forEach(mock => mock.mockReset());
	Object.values(mockBoxClient.search).forEach(mock => mock.mockReset());
	mockBoxSDK.getBasicClient.mockReset();
	MockBoxSDK.mockReset();
	mockBoxSDK.getBasicClient.mockReturnValue(mockBoxClient);
	MockBoxSDK.mockReturnValue(mockBoxSDK);
};
