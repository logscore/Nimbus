import type { DriveInfo, File } from "@/providers/interface/types";
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
