// import type { Tag } from "./file";

export interface ApiResponse<T = unknown> {
	route: string;
	success: boolean;
	message?: string;
	data?: T;
}

// export interface TagOperationResponse extends ApiResponse<Tag | Tag[]> {}
// export interface FileTagOperationResponse extends ApiResponse<FileTag[]> {}
