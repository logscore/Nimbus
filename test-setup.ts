import { vi } from "vitest";

// Mock Microsoft Graph Client to prevent real API calls in CI environments
// This mock is designed to be transparent to dependency injection
vi.mock("@microsoft/microsoft-graph-client", () => {
	return {
		Client: {
			init: vi.fn(() => {
				// Throw an error with helpful message - this should never be called in proper tests
				throw new Error(
					"Real Microsoft Graph Client.init() called in test environment. " +
						"Tests should use dependency injection via createProviderWithMockClient() from test-utils."
				);
			}),
			initWithMiddleware: vi.fn(() => {
				throw new Error(
					"Real Microsoft Graph Client.initWithMiddleware() called in test environment. " +
						"Tests should use dependency injection via createProviderWithMockClient() from test-utils."
				);
			}),
		},
	};
});

// Set up global test environment
// Note: Individual tests should set up their own fetch mocks as needed
