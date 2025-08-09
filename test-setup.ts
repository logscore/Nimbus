import { vi } from "vitest";

// Mock Microsoft Graph Client only when called directly (not through dependency injection)
vi.mock("@microsoft/microsoft-graph-client", async () => {
	const actual = await vi.importActual("@microsoft/microsoft-graph-client");

	// Create a mock client that provides safe fallback behavior
	const mockClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi.fn().mockResolvedValue({ id: "fallback-id", name: "Test Item" }),
		get: vi.fn().mockResolvedValue({ id: "fallback-id", name: "Test Item" }),
		put: vi.fn().mockResolvedValue({ id: "fallback-id", name: "Test Item" }),
		patch: vi.fn().mockResolvedValue({ id: "fallback-id", name: "Test Item" }),
		delete: vi.fn().mockResolvedValue({}),
	};

	return {
		...actual,
		Client: {
			init: vi.fn(() => mockClient),
			initWithMiddleware: vi.fn(() => mockClient),
		},
	};
});

// Set up global test environment
// Note: Individual tests should set up their own fetch mocks as needed
