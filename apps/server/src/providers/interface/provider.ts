import type { DriveInfo, File, DownloadOptions, DownloadResult } from "@/providers/interface/types";
import type { Readable } from "node:stream";

export interface Provider {
	/**
	 * List files in the user's drive.
	 * @param parent The ID of the parent folder to query files from
	 * @param pageSize The number of files to return per page
	 * @param pageToken The next page token or URL for pagination
	 * @param returnedValues The values the file object will contain. (https://learn.microsoft.com/en-us/onedrive/developer/rest-api/concepts/optional-query-parameters?view=odsp-graph-online) (https://developers.google.com/workspace/drive/api/guides/fields-parameter)
	 * @returns An array of files of type File, and the next page token
	 */
	listFiles(
		parent: string,
		pageSize: number,
		returnedValues: string[],
		pageToken?: string
	): Promise<{ files: File[]; nextPageToken?: string }>;

	/**
	 * Get a file by ID
	 * @param id The ID of the file to retrieve
	 * @param returnedValues The values the file object will contain. (https://learn.microsoft.com/en-us/onedrive/developer/rest-api/concepts/optional-query-parameters?view=odsp-graph-online) (https://developers.google.com/workspace/drive/api/guides/fields-parameter)
	 * @returns The file of type File
	 */
	getFileById(id: string, returnedValues: string[]): Promise<File | null>;

	/**
	 * Create file or folder
	 * @param name The name of the file or folder
	 * @param mimeType The MIME type of the file
	 * @param parent The parent folder ID
	 * @returns The created file of type File
	 */
	createFile(name: string, mimeType: string, parent?: string): Promise<File | null>;

	/**
	 * Update a file
	 * @param fileId The ID of the file to update
	 * @param name The new name for the file
	 * @returns The updated file of type File
	 */
	updateFile(fileId: string, name: string): Promise<File | null>;

	/**
	 * Delete a file
	 * @param fileId The ID of the file to delete
	 * @returns boolean indicating success
	 */
	deleteFile(fileId: string): Promise<boolean>;

	/**
	 * Download a file
	 * @param fileId The ID of the file to download
	 * @param options Download options including export MIME type for Google Workspace files
	 * @returns File content and metadata
	 */
	downloadFile(fileId: string, options?: DownloadOptions): Promise<DownloadResult | null>;

	/**
	 * Upload a file
	 * @param name The name of the file
	 * @param mimeType The MIME type of the file
	 * @param fileContent The file content as a Buffer or Readable stream
	 * @param returnedValues The file values you want to return
	 * @param parent The parent folder ID. Optional. Defaults to root.
	 * @returns The uploaded file information
	 */
	uploadFile(
		name: string,
		mimeType: string,
		fileContent: Buffer | Readable,
		returnedValues: string[],
		parent?: string
	): Promise<File | null>;

	// Future methods:
	// copyFile(fileId: string, newName?: string, parent?: string): Promise<File | null>;
	// exportFile(fileId: string, mimeType: string): Promise<Blob | null>;
	getDriveInfo(): Promise<DriveInfo | null>;
}
