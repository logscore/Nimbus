import { vi } from "vitest";

// Global Microsoft Graph Client module mock to prevent ANY real API calls
vi.mock("@microsoft/microsoft-graph-client", () => {
	// Create a comprehensive mock that matches the Microsoft Graph Client interface
	const mockClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi.fn().mockResolvedValue({ id: "global-mock", name: "Global Mock" }),
		get: vi.fn().mockResolvedValue({ id: "global-mock", name: "Global Mock" }),
		put: vi.fn().mockResolvedValue({ id: "global-mock", name: "Global Mock" }),
		patch: vi.fn().mockResolvedValue({ id: "global-mock", name: "Global Mock" }),
		delete: vi.fn().mockResolvedValue({}),
	};

	return {
		Client: {
			init: vi.fn(() => mockClient),
			initWithMiddleware: vi.fn(() => mockClient),
		},
	};
});

// Set up global test environment
// Note: Individual tests should set up their own fetch mocks as needed
