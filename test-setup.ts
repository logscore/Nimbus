import { vi } from "vitest";

vi.mock("@azure/msal-node", () => ({
	PublicClientApplication: vi.fn(),
}));

vi.mock("@microsoft/microsoft-graph-client", () => ({
	Client: {
		init: vi.fn(),
	},
}));

vi.mock("box-node-sdk", () => {
	const mockGetBasicClient = vi.fn();
	const BoxSDK = vi.fn(() => ({
		getBasicClient: mockGetBasicClient,
	}));

	return {
		default: BoxSDK,
		__esModule: true,
	};
});
