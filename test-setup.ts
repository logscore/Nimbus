import { vi } from "vitest";

// Mock fetch globally for any HTTP requests
global.fetch = vi.fn();
