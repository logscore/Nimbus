import type { File, DriveInfo, DownloadOptions, DownloadResult } from "../interface/types";
import type { File as OneDriveFile } from "@/providers/microsoft/types";
import { OneDrive } from "@nimbus/server/lib/one-drive/src/client";
import type { Provider } from "@/providers/interface/provider";
import type { Readable } from "node:stream";

export class OneDriveProvider implements Provider {
	private drive: OneDrive;
	private accessToken: string;

	constructor(drive: OneDrive, accessToken: string) {
		this.drive = drive;
		this.accessToken = accessToken;
	}

	/**
	 * List files in the user's OneDrive.
	 * @param parent The ID of the parent folder to query files from
	 * @param pageSize The number of files to return per page
	 * @param returnedValues The values the file object will contain
	 * @param pageToken The next page token for pagination
	 * @returns An array of files of type File, and the next page token
	 */
	async listFiles(
		parent: string,
		pageSize: number,
		returnedValues: string[],
		pageToken?: string
	): Promise<{ files: File[]; nextPageToken?: string }> {
		const parentId = parent || "root";
		const queryParams = new URLSearchParams({
			$top: pageSize.toString(),
			$select: returnedValues.join(","),
		});

		if (pageToken) {
			queryParams.append("$skiptoken", pageToken);
		}

		const res: Response = await this.drive.get(`/me/drive/items/${parentId}/children?${queryParams.toString()}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return { files: [] };
		}

		const data = (await res.json()) as { value: OneDriveFile[]; "@odata.nextLink"?: string };
		const files: File[] = data.value.map(file => convertOneDriveFileToProviderFile(file));

		// Extract next page token from nextLink if available
		let nextPageToken: string | undefined;
		if (data["@odata.nextLink"]) {
			const url = new URL(data["@odata.nextLink"]);
			nextPageToken = url.searchParams.get("$skiptoken") || undefined;
		}

		return { files, nextPageToken };
	}

	/**
	 * Get a file by ID
	 * @param id The ID of the file to retrieve
	 * @param returnedValues The values the file object will contain
	 * @returns The file of type File
	 */
	async getFileById(id: string, returnedValues: string[]): Promise<File | null> {
		const queryParams = new URLSearchParams({
			$select: returnedValues.join(","),
		});

		const res: Response = await this.drive.get(`/me/drive/items/${id}?${queryParams.toString()}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	/**
	 * Create file or folder
	 * @param name The name of the file or folder
	 * @param mimeType The MIME type of the file
	 * @param parent The parent folder ID
	 * @returns The created file of type File
	 */
	async createFile(name: string, mimeType: string, parent?: string): Promise<File | null> {
		const parentId = parent || "root";

		const res: Response = await this.drive.post(`/me/drive/items/${parentId}/children`, {
			body: {
				name,
				folder: mimeType === "application/vnd.microsoft.folder" ? {} : undefined,
				file: mimeType !== "application/vnd.microsoft.folder" ? {} : undefined,
			},
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	/**
	 * Create a folder
	 * @param name The name of the folder
	 * @param parent The parent folder ID
	 * @returns The created folder of type File
	 */
	async createFolder(name: string, parent?: string): Promise<File | null> {
		return this.createFile(name, "application/vnd.microsoft.folder", parent);
	}

	/**
	 * Update a file
	 * @param fileId The ID of the file to update
	 * @param name The new name for the file
	 * @returns The updated file of type File
	 */
	async updateFile(fileId: string, name: string): Promise<File | null> {
		const res: Response = await this.drive.patch(`/me/drive/items/${fileId}`, {
			body: { name },
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	/**
	 * Delete a file
	 * @param fileId The ID of the file to delete
	 * @returns boolean indicating success
	 */
	async deleteFile(fileId: string): Promise<boolean> {
		const res: Response = await this.drive.delete(`/me/drive/items/${fileId}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		return res.status === 204;
	}

	/**
	 * Download a file from OneDrive
	 * @param fileId The ID of the file to download
	 * @param options Download options (not used for OneDrive)
	 * @returns File content and metadata
	 */
	async downloadFile(fileId: string, options?: DownloadOptions): Promise<DownloadResult | null> {
		// OneDrive doesn't support export options like Google Drive
		try {
			// First, get file metadata to determine the MIME type and name
			const fileMetadata = await this.getFileById(fileId, ["id", "name", "size", "@microsoft.graph.downloadUrl"]);

			if (!fileMetadata) {
				return null;
			}

			// For OneDrive, we can use the download URL directly
			const downloadUrl = (fileMetadata as any)["@microsoft.graph.downloadUrl"];
			if (!downloadUrl) {
				return null;
			}

			const response = await fetch(downloadUrl);
			if (!response.ok) {
				throw new Error(`OneDrive API error: ${response.status} ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			return {
				data: buffer,
				filename: fileMetadata.name,
				mimeType: response.headers.get("Content-Type") || "application/octet-stream",
				size: buffer.length,
			};
		} catch (error) {
			console.error("Error downloading file from OneDrive:", error);
			return null;
		}
	}

	/**
	 * Upload a file to OneDrive
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
		try {
			const parentId = parent || "root";

			// Convert file content to buffer if it's a Readable stream
			let buffer: Buffer;
			if (Buffer.isBuffer(fileContent)) {
				buffer = fileContent;
			} else {
				// Convert Readable stream to buffer
				const chunks: Buffer[] = [];
				for await (const chunk of fileContent) {
					chunks.push(Buffer.from(chunk));
				}
				buffer = Buffer.concat(chunks);
			}

			// Upload file using OneDrive API
			const res: Response = await this.drive.put(`/me/drive/items/${parentId}:/${name}:/content`, {
				body: buffer,
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"Content-Type": mimeType,
				},
			});

			if (!res.ok) {
				return null;
			}

			const data = (await res.json()) as OneDriveFile;
			return convertOneDriveFileToProviderFile(data);
		} catch (error) {
			console.error("Error uploading file to OneDrive:", error);
			return null;
		}
	}

	/**
	 * Get drive information
	 * @returns Drive information including usage and limits
	 */
	async getDriveInfo(): Promise<DriveInfo | null> {
		try {
			const res: Response = await this.drive.get("/me/drive", {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				},
			});

			if (!res.ok) {
				return null;
			}

			const data = (await res.json()) as any;

			return {
				usage: data.quota?.used?.toString() || "0",
				limit: data.quota?.total?.toString() || "0",
				usageInTrash: data.quota?.deleted?.toString() || "0",
			};
		} catch (error) {
			console.error("Error getting OneDrive info:", error);
			return null;
		}
	}
}

/**
 * Convert OneDrive file format to provider-agnostic File format
 */
function convertOneDriveFileToProviderFile(file: OneDriveFile): File {
	return {
		id: file.id,
		name: file.name,
		parent: file.parentReference?.id ?? "",
		size: file.size?.toString() ?? null,
		mimeType: file.file?.mimeType ?? (file.folder ? "application/vnd.microsoft.folder" : ""),
		creationDate: file.createdDateTime ?? null,
		modificationDate: file.lastModifiedDateTime ?? null,
		// OneDrive specific properties
		webContentLink: file["@microsoft.graph.downloadUrl"] ?? null,
		webViewLink: file.webUrl ?? null,
	};
}
