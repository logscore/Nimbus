import { vi } from "vitest";

vi.mock("@azure/msal-node", () => ({
	PublicClientApplication: vi.fn(),
}));

vi.mock("@microsoft/microsoft-graph-client", () => {
	const mockApiChain = {
		get: () => Promise.resolve({ id: "global-mock-id", name: "global-mock-file" }),
		post: () => Promise.resolve({ id: "global-mock-id", name: "global-mock-file" }),
		patch: () => Promise.resolve({ id: "global-mock-id", name: "global-mock-file" }),
		put: () => Promise.resolve({ id: "global-mock-id", name: "global-mock-file" }),
		delete: () => Promise.resolve({}),
		query: () => mockApiChain, // Allow chaining after query()
	};

	const mockClient = {
		api: () => mockApiChain,
	};

	return {
		Client: {
			init: vi.fn(() => mockClient),
		},
	};
});

vi.mock("box-node-sdk", () => {
	const mockBoxClient = {
		files: {
			get: () => Promise.resolve({ id: "global-box-file", name: "global-mock-file.txt" }),
			uploadFile: () => Promise.resolve({ entries: [{ id: "global-box-file", name: "global-mock-file.txt" }] }),
			update: () => Promise.resolve({ id: "global-box-file", name: "global-mock-file.txt" }),
			delete: () => Promise.resolve({}),
			copy: () => Promise.resolve({ id: "global-box-file", name: "global-mock-file.txt" }),
			getReadStream: () => Promise.resolve({}),
		},
		folders: {
			get: () => Promise.resolve({ id: "global-box-folder", name: "global-mock-folder" }),
			create: () => Promise.resolve({ id: "global-box-folder", name: "global-mock-folder" }),
			getItems: () => Promise.resolve({ entries: [] }),
			update: () => Promise.resolve({ id: "global-box-folder", name: "global-mock-folder" }),
			delete: () => Promise.resolve({}),
			copy: () => Promise.resolve({ id: "global-box-folder", name: "global-mock-folder" }),
		},
		users: {
			get: () => Promise.resolve({ space_amount: 1000000, space_used: 500000 }),
		},
		search: {
			query: () => Promise.resolve({ entries: [] }),
		},
	};

	const mockGetBasicClient = vi.fn(() => mockBoxClient);
	const BoxSDK = vi.fn(() => ({
		getBasicClient: mockGetBasicClient,
	}));

	return {
		default: BoxSDK,
		__esModule: true,
	};
});
