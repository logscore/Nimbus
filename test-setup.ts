import { vi } from "vitest";

// Fallback Microsoft Graph Client module mock - only used if dependency injection fails
vi.mock("@microsoft/microsoft-graph-client", () => {
	// This mock only serves as a safety net - dependency injection should take precedence
	const fallbackClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi
			.fn()
			.mockRejectedValue(new Error("Test should use dependency injection - use createProviderWithMockClient()")),
		get: vi
			.fn()
			.mockRejectedValue(new Error("Test should use dependency injection - use createProviderWithMockClient()")),
		put: vi
			.fn()
			.mockRejectedValue(new Error("Test should use dependency injection - use createProviderWithMockClient()")),
		patch: vi
			.fn()
			.mockRejectedValue(new Error("Test should use dependency injection - use createProviderWithMockClient()")),
		delete: vi
			.fn()
			.mockRejectedValue(new Error("Test should use dependency injection - use createProviderWithMockClient()")),
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
