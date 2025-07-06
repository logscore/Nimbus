import type { DriveInfo, File, DownloadOptions, DownloadResult } from "@/providers/interface/types";
import type { Provider } from "@/providers/interface/provider";
import { OAuth2Client } from "google-auth-library";
import { drive_v3 } from "@googleapis/drive";
import { Readable } from "node:stream";

export class GoogleDriveProvider implements Provider {
	private drive: drive_v3.Drive;

	constructor(accessToken: string) {
		const oauth2Client = new OAuth2Client();
		oauth2Client.setCredentials({ access_token: accessToken });
		this.drive = new drive_v3.Drive({ auth: oauth2Client });
	}

	/**
	 * List files in the user's Google Drive.
	 * @param parent The IDs of the parent folder to query files from
	 * @param pageSize The number of files to return per page
	 * @param returnedValues The values the file object will contain
	 * @param pageToken The next page token or URL for pagination
	 * @returns An array of files of type File, and the next page token
	 */
	async listFiles(
		parent: string,
		pageSize: number,
		returnedValues: string[],
		pageToken?: string
	): Promise<{ files: File[]; nextPageToken?: string }> {
		const response = await this.drive.files.list({
			// TODO: add query filtering for sort/filter functionality
			fields: `files(${returnedValuesToFields(returnedValues)}), nextPageToken`,
			pageSize,
			pageToken,
			q: parent ? `'${parent}' in parents and trashed=false` : undefined,
		});

		if (!response.data.files) {
			// TODO: implement either better error handling or better empty state on front end. Probably both...
			return { files: [] };
		}

		const files: File[] = response.data.files.map(file => convertGoogleDriveFileToProviderFile(file));

		return {
			files,
			nextPageToken: response.data.nextPageToken || undefined,
		};
	}

	async getFileById(id: string, returnedValues: string[]): Promise<File | null> {
		const response = await this.drive.files.get({
			fileId: id,
			fields: returnedValuesToFields(returnedValues),
		});

		if (!response.data) {
			return null;
		}

		return convertGoogleDriveFileToProviderFile(response.data);
	}

	/**
	 * Create a file in the user's Google Drive.
	 * @param name The name of the file
	 * @param mimeType The MIME type of the file
	 * @param parent The parent folder ID
	 * @returns The created file of type File
	 */
	async createFile(
		name: string,
		mimeType: string,
		parent?: string
		// filePath?: string or something to get the file from the user file system
	): Promise<File | null> {
		const fileMetadata: drive_v3.Schema$File = {
			name,
			//mimeType for the file itself
			mimeType: genericTypeToProviderMimeType(mimeType),
			parents: parent ? [parent] : ["root"],
		};

		const response = await this.drive.files.create({
			media: {
				// Mimetype for the data being uploaded
				mimeType: genericTypeToProviderMimeType(mimeType),
				// body: fs.createReadStream(filePath),
			},
			requestBody: fileMetadata,
			fields: "id, name, mimeType, parents", // this returns the file object with the specified fields
		});

		if (!response.data) {
			return null;
		}

		return convertGoogleDriveFileToProviderFile(response.data);
	}

	/**
	 * Update a file from Google Drive
	 * Folders are also files in Google Drive
	 * @param fileId The ID of the file to update
	 * @param name The new name for the file
	 * @returns The updated file of type File
	 */
	async updateFile(fileId: string, name: string): Promise<File | null> {
		const response = await this.drive.files.update({
			fileId,
			requestBody: {
				name,
			},
			fields: "id, name, mimeType, parents",
		});

		if (!response.data) {
			return null;
		}

		return convertGoogleDriveFileToProviderFile(response.data);
	}

	/**
	 * Delete a file from Google Drive
	 * @param fileId The ID of the file to delete
	 * @returns boolean indicating success
	 */
	async deleteFile(fileId: string): Promise<boolean> {
		try {
			await this.drive.files.delete({
				fileId,
			});
			return true;
		} catch {
			return false;
		}
	}

	async createFolder(name: string, parent?: string): Promise<File | null> {
		return this.createFile(name, "application/vnd.google-apps.folder", parent);
	}

	/**
	 * Upload a file to Google Drive
	 * @param name The name of the file
	 * @param mimeType The MIME type of the file
	 * @param fileContent The file content as a Buffer or Readable stream
	 * @param returnedValues The file values you want to return
	 * @param parent The parent folder ID. Optional. Defaults to root.
	 * @returns The uploaded file information
	 */
	async uploadFile(
		name: string,
		mimeType: string,
		fileContent: Buffer | Readable,
		returnedValues: string[],
		parent?: string
	): Promise<File | null> {
		let contentStream: Readable;
		if (Buffer.isBuffer(fileContent)) {
			contentStream = new Readable();
			contentStream.push(fileContent);
			contentStream.push(null);
		} else {
			contentStream = fileContent;
		}
		try {
			const fileMetadata: drive_v3.Schema$File = {
				name,
				mimeType: genericTypeToProviderMimeType(mimeType),
				parents: parent ? [parent] : ["root"],
			};

			const media = {
				mimeType: genericTypeToProviderMimeType(mimeType),
				body: contentStream,
			};

			const response = await this.drive.files.create({
				requestBody: fileMetadata,
				media,
				fields: returnedValuesToFields(returnedValues),
			});

			if (!response.data) {
				return null;
			}

			return convertGoogleDriveFileToProviderFile(response.data);
		} catch (error) {
			console.error("Error uploading file to Google Drive:", error);
			throw error;
		}
	}

	// Drive methods

	async getDriveInfo(): Promise<DriveInfo | null> {
		const driveAbout = await this.drive.about.get({
			fields: "storageQuota(limit, usage, usageInDriveTrash)",
		});

		if (!driveAbout.data) {
			return null;
		}

		return {
			limit: driveAbout.data.storageQuota?.limit,
			usage: driveAbout.data.storageQuota?.usage,
			usageInTrash: driveAbout.data.storageQuota?.usageInDriveTrash,
		} as DriveInfo;
	}

	/**
	 * Download a file from Google Drive
	 * @param fileId The ID of the file to download
	 * @param options Download options including export MIME type for Google Workspace files
	 * @returns File content and metadata
	 */
	async downloadFile(fileId: string, options?: DownloadOptions): Promise<DownloadResult | null> {
		try {
			// First, get file metadata to determine the MIME type and name
			const fileMetadata = await this.drive.files.get({
				fileId,
				fields: "id, name, mimeType, size",
			});

			if (!fileMetadata.data || !fileMetadata.data.name) {
				return null;
			}

			const isGoogleWorkspaceFile = fileMetadata.data.mimeType?.startsWith("application/vnd.google-apps.");

			let downloadData: any;
			let finalMimeType = fileMetadata.data.mimeType || "application/octet-stream";
			let filename = fileMetadata.data.name;

			if (isGoogleWorkspaceFile && options?.exportMimeType) {
				// For Google Workspace files, use export
				downloadData = await this.drive.files.export({
					fileId,
					mimeType: options.exportMimeType,
				});
				finalMimeType = options.exportMimeType;

				// Update filename with appropriate extension
				filename = this.addFileExtension(filename, options.exportMimeType);
			} else {
				// For regular files, use direct download with acknowledgeAbuse option
				const queryParams = new URLSearchParams({
					alt: "media",
				});

				if (options?.acknowledgeAbuse) {
					queryParams.append("acknowledgeAbuse", "true");
				}

				const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${queryParams.toString()}`, {
					headers: {
						Authorization: `Bearer ${(this.drive.context._options.auth as any).credentials.access_token}`,
						Accept: "*/*",
					},
				});

				if (!response.ok) {
					// If we get a 403 with "acknowledgeAbuse" error, try again with acknowledgeAbuse=true
					if (response.status === 403) {
						const errorText = await response.text();
						if (errorText.includes("acknowledgeAbuse")) {
							queryParams.set("acknowledgeAbuse", "true");
							const retryResponse = await fetch(
								`https://www.googleapis.com/drive/v3/files/${fileId}?${queryParams.toString()}`,
								{
									headers: {
										Authorization: `Bearer ${(this.drive.context._options.auth as any).credentials.access_token}`,
										Accept: "*/*",
									},
								}
							);

							if (!retryResponse.ok) {
								throw new Error(`Google Drive API error: ${retryResponse.status} ${retryResponse.statusText}`);
							}

							const blob = await retryResponse.blob();
							downloadData = await blob.arrayBuffer();
						} else {
							throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`);
						}
					} else {
						throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`);
					}
				} else {
					// Get the response as a blob first to preserve binary data
					const blob = await response.blob();
					downloadData = await blob.arrayBuffer();
				}
			}

			if (!downloadData) {
				return null;
			}

			// Convert response to buffer
			let buffer: Buffer;
			if (downloadData instanceof Buffer) {
				buffer = downloadData;
			} else if (downloadData instanceof ArrayBuffer) {
				buffer = Buffer.from(downloadData);
			} else if (typeof downloadData === "string") {
				buffer = Buffer.from(downloadData, "utf-8");
			} else if (downloadData && typeof downloadData === "object" && "arrayBuffer" in downloadData) {
				// Handle Response objects
				buffer = Buffer.from(await downloadData.arrayBuffer());
			} else if (downloadData && typeof downloadData === "object" && "body" in downloadData) {
				// Handle stream-like objects
				const chunks: Buffer[] = [];
				const reader = downloadData.body?.getReader();
				if (reader) {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						chunks.push(Buffer.from(value));
					}
					buffer = Buffer.concat(chunks);
				} else {
					throw new Error("Unable to read file data");
				}
			} else {
				// Fallback: try to convert to string and then to buffer
				buffer = Buffer.from(String(downloadData));
			}

			return {
				data: buffer,
				filename,
				mimeType: finalMimeType,
				size: buffer.length,
			};
		} catch (error) {
			console.error("Error downloading file:", error);
			return null;
		}
	}

	/**
	 * Add appropriate file extension based on MIME type
	 */
	private addFileExtension(filename: string, mimeType: string): string {
		const extensionMap: Record<string, string> = {
			"application/pdf": ".pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
			"text/plain": ".txt",
			"text/html": ".html",
			"text/css": ".css",
			"application/json": ".json",
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"image/gif": ".gif",
			"image/svg+xml": ".svg",
		};

		const extension = extensionMap[mimeType];
		if (extension && !filename.endsWith(extension)) {
			return filename + extension;
		}
		return filename;
	}
}

// Helper functions

function convertGoogleDriveFileToProviderFile(file: drive_v3.Schema$File): File {
	return {
		id: file.id ?? "",
		name: file.name ?? "",
		parent: file.parents?.[0] ?? "",
		size: file.size ?? null,
		mimeType: file.mimeType ?? "",
		creationDate: file.createdTime ?? null,
		modificationDate: file.modifiedTime ?? null,
		// ! these are temporary Google drive specific properties. Remove them when we have a better implementation
		webContentLink: file.webContentLink ?? null,
		webViewLink: file.webViewLink ?? null,
	};
}

function returnedValuesToFields(returnedValues: string[]) {
	// Handle undefined behavior
	return returnedValues.join(", ");
}

function genericTypeToProviderMimeType(type: string): string {
	const mimeTypeMap: Record<string, string> = {
		document: "application/vnd.google-apps.document",
		spreadsheet: "application/vnd.google-apps.spreadsheet",
		presentation: "application/vnd.google-apps.presentation",
		folder: "application/vnd.google-apps.folder",
	};

	return mimeTypeMap[type] || type;
}
