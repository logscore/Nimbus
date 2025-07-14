import type { File } from "@nimbus/shared";

// Make sure you keep import File from @nimbus/shared

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

export interface DownloadOptions {
	/**
	 * For Google Workspace files, specify the export format
	 */
	exportMimeType?: string;

	/**
	 * Whether to acknowledge the risk when downloading malware
	 */
	acknowledgeAbuse?: boolean;
}

export interface DownloadResult {
	data: Buffer;
	filename: string;
	mimeType: string;
	size: number;
}
