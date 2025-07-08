export type ProviderName = "google" | "microsoft";

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

export interface DriveInfo {
	totalSpace: number;
	usedSpace: number;
	trashSize: number;
	trashItems: number;
	fileCount: number;
	state?: string;
	providerMetadata?: Record<string, unknown>;
}
