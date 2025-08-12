import { vi } from "vitest";

// Mock authentication libraries for unit test isolation
vi.mock("@azure/msal-node", () => ({
	PublicClientApplication: vi.fn(),
}));
