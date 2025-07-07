export type ProviderName = "google" | "microsoft";

export type FileType = "file" | "folder" | "shortcut" | "other";

export interface FileMetadata {
	/** The name of the file including the file extension */
	name: string;

	/** The MIME type of the file */
	mimeType?: string;

	/** ID of the parent folder */
	parentId?: string;

	/** Description of the file */
	description?: string;

	/** Size of the file in bytes */
	size?: number;

	/** Web URL to view the file */
	webViewLink?: string;

	/** Direct download URL for the file content */
	webContentLink?: string;

	/** ISO 8601 date string when the file was created */
	createdTime?: string;

	/** ISO 8601 date string when the file was last modified */
	modifiedTime?: string;

	/** Custom metadata specific to the provider */
	providerMetadata?: Record<string, unknown>;
}

export interface File extends FileMetadata {
	/** Unique identifier for the file */
	id: string;

	/** Type of the file */
	type: FileType;

	/** ID of the parent folder */
	parentId: string;

	/** Size of the file in bytes */
	size: number;

	/** ISO 8601 date string when the file was created */
	createdTime: string;

	/** ISO 8601 date string when the file was last modified */
	modifiedTime: string;

	/** Tags associated with the file */
	tags?: Tag[];

	/** Whether the file has been trashed */
	trashed?: boolean;
}

export interface Tag {
	id: string;
	name: string;
	color: string;
	parentId?: string | null;
	userId: string;
	createdAt: string;
	updatedAt: string;
	_count?: number;
	children?: Tag[];
}

export interface ListFilesOptions {
	/** Maximum number of items to return per page */
	pageSize?: number;

	/** Token to fetch the next page of results */
	pageToken?: string;

	/** Fields to include in the response */
	fields?: string[];

	/** Filter expression to apply */
	filter?: string;

	/** Order by expression */
	orderBy?: string;

	/** Whether to include trashed items */
	includeTrashed?: boolean;
}

export interface ListFilesResult {
	/** Array of files/folders */
	items: File[];

	/** Token to fetch the next page of results */
	nextPageToken?: string;
}

export interface DriveInfo {
	/** Total storage space in bytes */
	totalSpace: number;

	/** Used storage space in bytes */
	usedSpace: number;

	/** Storage space in trash in bytes */
	trashSize: number;

	/** Number of items in trash */
	trashItems: number;

	/** Total number of files */
	fileCount: number;

	/** Storage quota state (e.g., 'normal', 'nearLimit', etc.) */
	state?: string;

	/** Provider-specific metadata */
	providerMetadata?: Record<string, unknown>;
}
