import { vi } from "vitest";

// Mock Microsoft Graph Client to prevent real API calls in CI environments
vi.mock("@microsoft/microsoft-graph-client", () => ({
	Client: {
		init: vi.fn().mockReturnValue({
			api: vi.fn().mockReturnThis(),
			query: vi.fn().mockReturnThis(),
			header: vi.fn().mockReturnThis(),
			post: vi.fn().mockResolvedValue({}),
			get: vi.fn().mockResolvedValue({}),
			put: vi.fn().mockResolvedValue({}),
			patch: vi.fn().mockResolvedValue({}),
			delete: vi.fn().mockResolvedValue({}),
		}),
		initWithMiddleware: vi.fn().mockReturnValue({
			api: vi.fn().mockReturnThis(),
			query: vi.fn().mockReturnThis(),
			header: vi.fn().mockReturnThis(),
			post: vi.fn().mockResolvedValue({}),
			get: vi.fn().mockResolvedValue({}),
			put: vi.fn().mockResolvedValue({}),
			patch: vi.fn().mockResolvedValue({}),
			delete: vi.fn().mockResolvedValue({}),
		}),
	},
}));

// Mock fetch globally for any HTTP requests
global.fetch = vi.fn();
