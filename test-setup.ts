import { vi } from "vitest";

// Global Microsoft Graph Client module mock - acts as safety net for CI environments
// This prevents any real API calls while still allowing dependency injection to work
vi.mock("@microsoft/microsoft-graph-client", () => {
	// Create fallback client that throws meaningful errors if used directly
	const fallbackClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi.fn().mockRejectedValue(new Error("Global mock: Use dependency injection in tests")),
		get: vi.fn().mockRejectedValue(new Error("Global mock: Use dependency injection in tests")),
		put: vi.fn().mockRejectedValue(new Error("Global mock: Use dependency injection in tests")),
		patch: vi.fn().mockRejectedValue(new Error("Global mock: Use dependency injection in tests")),
		delete: vi.fn().mockRejectedValue(new Error("Global mock: Use dependency injection in tests")),
	};

	return {
		Client: {
			init: vi.fn(() => fallbackClient),
			initWithMiddleware: vi.fn(() => fallbackClient),
		},
	};
});

// Set up global test environment
// Note: Individual tests should set up their own fetch mocks as needed
