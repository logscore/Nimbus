import { vi } from "vitest";

// Mock Microsoft Graph Client to prevent real API calls in CI environments
vi.mock("@microsoft/microsoft-graph-client", () => ({
	Client: {
		init: vi.fn(),
		initWithMiddleware: vi.fn(),
	},
}));

// Mock fetch globally for any HTTP requests
global.fetch = vi.fn();
