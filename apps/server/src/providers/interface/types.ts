import type { DriveInfo, File, FileMetadata, FileTag, FileType, ProviderName, Tag } from "@nimbus/shared";

// Re-export types from shared package
export type { DriveInfo, File, FileMetadata, FileTag, FileType, ProviderName, Tag };

/**
 * Options for listing files from a storage provider
 */
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

/**
 * Result of listing files from a storage provider
 */
export interface ListFilesResult {
	/** Array of files/folders */
	items: File[];

	/** Token to fetch the next page of results */
	nextPageToken?: string;
}
