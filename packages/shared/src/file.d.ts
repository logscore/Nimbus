export type FileType = "file" | "folder" | "shortcut" | "other";

export interface FileMetadata {
	/** The name of the file including the file extension */
	name: string;

	/** The MIME type of the file */
	mimeType: string;

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
	/** Unique identifier for the tag */
	id: string;

	/** Display name of the tag */
	name: string;

	/** Color code for the tag (e.g., "#FF0000") */
	color: string;

	/** Optional parent tag ID for hierarchical tags */
	parentId?: string | null;

	/** ID of the user who owns the tag */
	userId: string;

	/** ISO 8601 date string when the tag was created */
	createdAt: string;

	/** ISO 8601 date string when the tag was last updated */
	updatedAt: string;

	/** Number of files associated with this tag (optional) */
	_count?: number;

	/** Child tags for hierarchical structure (optional) */
	children?: Tag[];
}

export interface FileTag {
	/** Unique identifier for the file-tag relationship */
	id: string;

	/** ID of the file */
	fileId: string;

	/** ID of the tag */
	tagId: string;

	/** ID of the user who created the relationship */
	userId: string;

	/** ISO 8601 date string when the relationship was created */
	createdAt: string;
}

export interface DriveInfo {
	/** Total storage space in bytes */
	totalSpace: number;

	/** Used storage space in bytes */
	usedSpace: number;

	/** Storage space used by trashed items in bytes */
	trashSize: number;

	/** Number of items in trash */
	trashItems: number;

	/** Total number of files */
	fileCount: number;

	/** Storage quota state (e.g., 'normal', 'nearLimit') */
	state?: string;

	/** Provider-specific metadata */
	providerMetadata?: Record<string, unknown>;
}
