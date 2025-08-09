import { vi } from "vitest";

// Fallback Microsoft Graph Client module mock - only used if dependency injection fails
vi.mock("@microsoft/microsoft-graph-client", () => {
	// This mock only serves as a safety net - dependency injection should take precedence
	const fallbackClient = {
		api: vi.fn().mockReturnThis(),
		query: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		post: vi.fn().mockResolvedValue({ id: "safe-fallback", name: "Safe Fallback" }),
		get: vi.fn().mockResolvedValue({ id: "safe-fallback", name: "Safe Fallback" }),
		put: vi.fn().mockResolvedValue({ id: "safe-fallback", name: "Safe Fallback" }),
		patch: vi.fn().mockResolvedValue({ id: "safe-fallback", name: "Safe Fallback" }),
		delete: vi.fn().mockResolvedValue({}),
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
