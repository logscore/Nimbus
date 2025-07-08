import type { DownloadOptions, DownloadResult } from "@/providers/interface/types";
import type { DriveInfo, File, FileMetadata } from "@nimbus/shared";
import type { ListFilesOptions, ListFilesResult } from "./types";

/**
 * Interface for cloud storage providers like Google Drive and OneDrive.
 * Provides a unified API for file and folder operations.
 */
export interface Provider {
	// ------------------------------------------------------------------------
	// Core CRUD Operations
	// ------------------------------------------------------------------------

	/**
	 * Create a new file or folder
	 * @param metadata Metadata for the new file/folder
	 * @param content Optional file content as a Buffer or Readable stream
	 * @returns The created file/folder or null if creation failed
	 */
	create(metadata: FileMetadata, content?: Buffer | NodeJS.ReadableStream): Promise<File | null>;

	/**
	 * Get a file or folder by ID
	 * @param id The ID of the file/folder to retrieve
	 * @param fields Optional array of fields to include in the response
	 * @returns The file/folder or null if not found
	 */
	getById(id: string, fields?: string[]): Promise<File | null>;

	/**
	 * Update a file or folder
	 * @param id The ID of the file/folder to update
	 * @param metadata The fields to update
	 * @returns The updated file/folder or null if update failed
	 */
	update(id: string, metadata: Partial<FileMetadata>): Promise<File | null>;

	/**
	 * Delete a file or folder
	 * @param id The ID of the file/folder to delete
	 * @param permanent If true, permanently delete instead of moving to trash
	 * @returns true if deletion was successful, false otherwise
	 */
	delete(id: string, permanent?: boolean): Promise<boolean>;

	// ------------------------------------------------------------------------
	// List Operations
	// ------------------------------------------------------------------------

	/**
	 * List files and folders in a directory
	 * @param parentId Optional parent folder ID (defaults to root)
	 * @param options Additional options for listing
	 * @returns Paginated list of files/folders
	 */
	listChildren(parentId?: string, options?: ListFilesOptions): Promise<ListFilesResult>;

	// ------------------------------------------------------------------------
	// File Operations
	// ------------------------------------------------------------------------

	/**
	 * Download file content
	 * @param id The ID of the file to download
	 * @returns File content as a Buffer or Readable stream
	 */
	// download(id: string): Promise<Buffer | NodeJS.ReadableStream | null>;

	/**
	 * Download a file
	 * @param fileId The ID of the file to download
	 * @param options Download options including export MIME type for Google Workspace files
	 * @returns File content and metadata
	 */
	download(fileId: string, options?: DownloadOptions): Promise<DownloadResult | null>;

	/**
	 * Copy a file or folder
	 * @param sourceId The ID of the file/folder to copy
	 * @param targetParentId The ID of the destination folder
	 * @param newName Optional new name for the copy
	 * @returns The copied file/folder or null if copy failed
	 */
	copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null>;

	/**
	 * Move a file or folder
	 * @param sourceId The ID of the file/folder to move
	 * @param targetParentId The ID of the destination folder
	 * @param newName Optional new name for the moved item
	 * @returns The moved file/folder or null if move failed
	 */
	move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null>;

	// ------------------------------------------------------------------------
	// Drive Information
	// ------------------------------------------------------------------------

	/**
	 * Get information about the drive
	 * @returns Drive information including usage statistics
	 */
	getDriveInfo(): Promise<DriveInfo | null>;

	// ------------------------------------------------------------------------
	// Utility Methods
	// ------------------------------------------------------------------------

	/**
	 * Get a shareable link for a file/folder
	 * @param id The ID of the file/folder
	 * @param permission The permission level for the link (e.g., 'view', 'edit')
	 * @returns The shareable URL or null if failed
	 */
	getShareableLink(id: string, permission?: "view" | "edit"): Promise<string | null>;

	/**
	 * Search for files and folders
	 * @param query Search query string
	 * @param options Additional search options
	 * @returns Paginated list of matching files/folders
	 */
	search(query: string, options?: Omit<ListFilesOptions, "filter">): Promise<ListFilesResult>;

	// ------------------------------------------------------------------------
	// Authentication
	// ------------------------------------------------------------------------

	/**
	 * Get the current access token
	 * @returns The current access token
	 */
	getAccessToken(): string;

	/**
	 * Set a new access token
	 * @param token The new access token to use
	 */
	setAccessToken(token: string): void;
}
