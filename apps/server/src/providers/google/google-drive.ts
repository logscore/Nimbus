import {
	DEFAULT_MIME_TYPE,
	DEFAULT_ORDER_BY,
	DEFAULT_PAGE_SIZE,
	DEFAULT_SPACE,
	type DriveInfo,
	type File,
	type FileMetadata,
} from "@nimbus/shared";
import type { DownloadOptions, DownloadResult, ListFilesOptions, ListFilesResult } from "@/providers/interface/types";
import type { Provider } from "@/providers/interface/provider";
import { OAuth2Client } from "google-auth-library";
import { drive_v3 } from "@googleapis/drive";
import { Readable } from "node:stream";

// commented fields for Google API performance

export class GoogleDriveProvider implements Provider {
	private drive: drive_v3.Drive;
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
		const oauth2Client = new OAuth2Client();
		oauth2Client.setCredentials({ access_token: accessToken });
		this.drive = new drive_v3.Drive({
			auth: oauth2Client,
		});
	}

	// ------------------------------------------------------------------------
	// Core CRUD Operations
	// ------------------------------------------------------------------------

	async create(metadata: FileMetadata, content?: Buffer | NodeJS.ReadableStream): Promise<File | null> {
		try {
			const isFolder =
				metadata.mimeType === "application/vnd.google-apps.folder" ||
				metadata.mimeType === "application/vnd.microsoft.folder";

			const mimeType = this.mapToGoogleMimeType(metadata.mimeType || DEFAULT_MIME_TYPE);

			const fileMetadata: drive_v3.Schema$File = {
				name: metadata.name,
				mimeType,
				parents: metadata.parentId ? [metadata.parentId] : ["root"],
				description: metadata.description,
			};

			let response;

			if (isFolder || !content) {
				// For folders or metadata-only files
				response = await this.drive.files.create({
					requestBody: fileMetadata,
					// fields: this.getFileFields(),
				});
			} else {
				// For files with content
				const media = {
					mimeType,
					body: this.normalizeContent(content),
				};

				response = await this.drive.files.create({
					requestBody: fileMetadata,
					media,
					// fields: this.getFileFields(),
				});
			}

			return response.data ? this.mapToFile(response.data) : null;
		} catch (error) {
			console.error("Error creating file/folder:", error);
			throw error;
		}
	}

	async getById(id: string, fields?: string[]): Promise<File | null> {
		try {
			const response = await this.drive.files.get({
				fileId: id,
				fields: this.getFieldsString(fields),
			});
			return response.data ? this.mapToFile(response.data) : null;
		} catch (error) {
			if ((error as any).code === 404) return null;
			throw error;
		}
	}

	async update(id: string, metadata: Partial<FileMetadata>): Promise<File | null> {
		try {
			const updateData: drive_v3.Schema$File = {};

			if (metadata.name) updateData.name = metadata.name;
			if (metadata.description !== undefined) updateData.description = metadata.description;
			if (metadata.parentId) updateData.parents = [metadata.parentId];

			const response = await this.drive.files.update({
				fileId: id,
				requestBody: updateData,
				// fields: this.getFileFields(),
			});

			return response.data ? this.mapToFile(response.data) : null;
		} catch (error) {
			console.error("Error updating file/folder:", error);
			throw error;
		}
	}

	async delete(id: string, permanent: boolean = false): Promise<boolean> {
		try {
			if (permanent) {
				await this.drive.files.delete({ fileId: id });
			} else {
				await this.drive.files.update({
					fileId: id,
					requestBody: { trashed: true },
				});
			}
			return true;
		} catch (error) {
			if ((error as any).code === 404) return false;
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// List Operations
	// ------------------------------------------------------------------------

	async listChildren(parentId: string = "root", options: ListFilesOptions = {}): Promise<ListFilesResult> {
		try {
			const queryParts = [];
			if (parentId) {
				queryParts.push(`'${parentId}' in parents`);
			}

			if (!options.includeTrashed) {
				queryParts.push("trashed = false");
			}

			const response = await this.drive.files.list({
				q: queryParts.join(" and "),
				pageSize: options.pageSize || DEFAULT_PAGE_SIZE,
				pageToken: options.pageToken,
				orderBy: options.orderBy || DEFAULT_ORDER_BY,
				fields: `files(${this.getFieldsString(options.fields)}), nextPageToken`,
			});

			return {
				items: response.data.files?.map(file => this.mapToFile(file)) || [],
				nextPageToken: response.data.nextPageToken || undefined,
			};
		} catch (error) {
			console.error("Error listing files:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// File Operations
	// ------------------------------------------------------------------------

	/**
	 * Download a file from Google Drive
	 * @param fileId The ID of the file to download
	 * @param options Download options including export MIME type for Google Workspace files
	 * @returns File content and metadata
	 */
	async download(fileId: string, options?: DownloadOptions): Promise<DownloadResult | null> {
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
			const buffer = Buffer.from(downloadData);

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

	async copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const response = await this.drive.files.copy({
				fileId: sourceId,
				requestBody: {
					name: newName,
					parents: [targetParentId],
				},
				fields: this.getFileFields(),
			});
			return response.data ? this.mapToFile(response.data) : null;
		} catch (error) {
			console.error("Error copying file/folder:", error);
			throw error;
		}
	}

	async move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			// First get the current parents
			const file = await this.drive.files.get({
				fileId: sourceId,
				fields: "parents",
			});

			// Remove from old parents and add to new parent
			const previousParents = file.data.parents?.join(",") || "";

			const response = await this.drive.files.update({
				fileId: sourceId,
				addParents: targetParentId,
				removeParents: previousParents,
				...(newName && { requestBody: { name: newName } }),
				fields: this.getFileFields(),
			});

			return response.data ? this.mapToFile(response.data) : null;
		} catch (error) {
			console.error("Error moving file/folder:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// Drive Information
	// ------------------------------------------------------------------------

	async getDriveInfo(): Promise<DriveInfo | null> {
		try {
			const response = await this.drive.about.get({
				fields: "storageQuota(limit, usage, usageInDriveTrash), user",
			});

			if (!response.data.storageQuota) return null;

			const limit = response.data.storageQuota.limit;
			const usage = response.data.storageQuota.usage;
			const usageInDriveTrash = response.data.storageQuota.usageInDriveTrash;

			// parseInt("") returns NaN
			const totalSpace = limit ? parseInt(limit) : DEFAULT_SPACE;
			const usedSpace = usage ? parseInt(usage) : DEFAULT_SPACE;
			const trashSize = usageInDriveTrash ? parseInt(usageInDriveTrash) : DEFAULT_SPACE;

			return {
				totalSpace: totalSpace || DEFAULT_SPACE,
				usedSpace: usedSpace || DEFAULT_SPACE,
				trashSize: trashSize || DEFAULT_SPACE,
				trashItems: 0, // Google Drive doesn't provide this in the quota
				fileCount: 0, // Google Drive doesn't provide this in the quota
				state: "normal",
				providerMetadata: {
					user: response.data.user,
				},
			};
		} catch (error) {
			console.error("Error getting drive info:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// Utility Methods
	// ------------------------------------------------------------------------

	async getShareableLink(id: string, permission: "view" | "edit" = "view"): Promise<string | null> {
		try {
			await this.drive.permissions.create({
				fileId: id,
				requestBody: {
					role: permission === "edit" ? "writer" : "reader",
					type: "anyone",
				},
			});

			const file = await this.drive.files.get({
				fileId: id,
				fields: "webViewLink, webContentLink",
			});

			return file.data.webViewLink || file.data.webContentLink || null;
		} catch (error) {
			console.error("Error creating shareable link:", error);
			throw error;
		}
	}

	async search(query: string, options: Omit<ListFilesOptions, "filter"> = {}): Promise<ListFilesResult> {
		try {
			const queryParts = [
				`name contains '${query.replace(/'/g, "''")}'`,
				...(!options.includeTrashed ? ["trashed = false"] : []),
			];

			const response = await this.drive.files.list({
				q: queryParts.join(" and "),
				pageSize: options.pageSize || DEFAULT_PAGE_SIZE,
				pageToken: options.pageToken,
				orderBy: options.orderBy || DEFAULT_ORDER_BY,
				fields: `files(${this.getFileFields()}), nextPageToken`,
			});

			return {
				items: response.data.files?.map(file => this.mapToFile(file)) || [],
				nextPageToken: response.data.nextPageToken || undefined,
			};
		} catch (error) {
			console.error("Error searching files:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// Helper Methods
	// ------------------------------------------------------------------------

	private mapToFile(file: drive_v3.Schema$File): File {
		const isFolder = file.mimeType === "application/vnd.google-apps.folder";
		const isShortcut = file.mimeType === "application/vnd.google-apps.shortcut";

		return {
			id: file.id || "",
			name: file.name || "",
			type: isFolder ? "folder" : isShortcut ? "shortcut" : "file",
			mimeType: file.mimeType || "application/octet-stream",
			parentId: file.parents?.[0] || "root",
			size: parseInt(file.size || "0"),
			webViewLink: file.webViewLink || undefined,
			webContentLink: file.webContentLink || undefined,
			createdTime: file.createdTime || new Date().toISOString(),
			modifiedTime: file.modifiedTime || new Date().toISOString(),
			description: file.description || undefined,
			trashed: file.trashed || false,
			providerMetadata: {
				...file,
			},
		};
	}

	private mapToGoogleMimeType(mimeType: string): string {
		const mimeTypeMap: Record<string, string> = {
			"application/vnd.microsoft.folder": "application/vnd.google-apps.folder",
			"application/msword": "application/vnd.google-apps.document",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.google-apps.document",
			"application/vnd.ms-excel": "application/vnd.google-apps.spreadsheet",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "application/vnd.google-apps.spreadsheet",
			"application/vnd.ms-powerpoint": "application/vnd.google-apps.presentation",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation":
				"application/vnd.google-apps.presentation",
		};

		return mimeTypeMap[mimeType] || mimeType;
	}

	private getFileFields(): string {
		return [
			"id",
			"name",
			"mimeType",
			"parents",
			"size",
			"createdTime",
			"modifiedTime",
			"webViewLink",
			"webContentLink",
			"description",
			"trashed",
			"shared",
			"sharedWithMeTime",
			"sharingUser",
			"owners",
			"lastModifyingUser",
			"capabilities",
		].join(",");
	}

	private getFieldsString(fields?: string[]): string {
		if (!fields || fields.length === 0) {
			return this.getFileFields();
		}
		return fields.join(",");
	}

	private normalizeContent(content: Buffer | NodeJS.ReadableStream): NodeJS.ReadableStream {
		if (Buffer.isBuffer(content)) {
			const readable = new Readable();
			readable.push(content);
			readable.push(null);
			return readable;
		}
		return content;
	}

	public getAccessToken(): string {
		return this.accessToken;
	}

	public setAccessToken(token: string): void {
		this.accessToken = token;
		const oauth2Client = new OAuth2Client();
		oauth2Client.setCredentials({ access_token: token });
		this.drive = new drive_v3.Drive({
			auth: oauth2Client,
		});
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
