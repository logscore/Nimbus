import type { DriveInfo, File } from "@/providers/interface/types";

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
	createFolder(name: string, mimeType: string, parent?: string): Promise<File | null>;

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
	 * Search files in the user's drive
	 * @param query The search query
	 * @param pageSize The number of files to return per page
	 * @param returnedValues The values the file object will contain
	 * @param pageToken The next page token for pagination
	 * @returns An array of files matching the search query and the next page token
	 */
	searchFiles(
		query: string,
		pageSize: number,
		returnedValues: string[],
		pageToken?: string
	): Promise<{ files: File[]; nextPageToken?: string }>;

	// Future methods:
	// copyFile(fileId: string, newName?: string, parent?: string): Promise<File | null>;
	// exportFile(fileId: string, mimeType: string): Promise<Blob | null>;
	getDriveInfo(): Promise<DriveInfo | null>;
}
