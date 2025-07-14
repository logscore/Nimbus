import type { Tag } from "./file";

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
}

export interface TagOperationResponse extends ApiResponse<Tag | Tag[]> {}
export interface FileTagOperationResponse extends ApiResponse<FileTag[]> {}

export interface AuthState {
	isLoading: boolean;
	error: string | null;
}

export interface UploadFileParams {
	file: File;
	parentId: string;
	onProgress?: (progress: number) => void;
}

export interface CreateFolderParams {
	name: string;
	parentId?: string;
}

export interface UpdateFileParams {
	fileId: string;
	name?: string;
	// Add other update properties like description later
}

export interface DeleteFileParams {
	fileId: string;
}
