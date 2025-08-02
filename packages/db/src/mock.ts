import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import type { DB } from "./index";
import { vi } from "vitest";

// Create a deep mock of the DB type
export const dbMock: DeepMockProxy<DB> = mockDeep<DB>();

// Extract the mock functions for easy access in tests
export const mockFindFirst = dbMock.query.user.findFirst;
export const mockSet = vi.fn();
export const mockWhere = vi.fn();

// Configure the mock's behavior to represent the chained methods
dbMock.update.mockReturnValue({
	set: mockSet,
} as any);

// Export the main update mock function as well
export const mockUpdate = dbMock.update;
