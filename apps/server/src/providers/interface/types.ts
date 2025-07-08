import type { File, FileMetadata, FileType, ProviderName, DriveInfo as SharedDriveInfo, Tag } from "@nimbus/shared";

export type { File, FileMetadata, FileType, ProviderName, SharedDriveInfo, Tag };

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

/**
 * Extended DriveInfo with server-specific fields
 */
export interface DriveInfo extends SharedDriveInfo {
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
