import { vi } from "vitest";

// Only mock authentication libraries that don't have fallback mocking in providers
vi.mock("@azure/msal-node", () => ({
	PublicClientApplication: vi.fn(),
}));
