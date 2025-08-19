import {
	DEFAULT_MIME_TYPE,
	DEFAULT_ORDER_BY,
	DEFAULT_PAGE_SIZE,
	DEFAULT_SPACE,
	type DownloadFileSchema,
	type DriveInfo,
	type File,
	type FileMetadata,
} from "@nimbus/shared";
import type { DownloadResult, ListFilesOptions, ListFilesResult } from "../interface/types";
import type { Provider } from "../interface/provider";
import { OAuth2Client } from "google-auth-library";
import { drive_v3 } from "@googleapis/drive";
import { Readable } from "node:stream";

// commented fields for Google API performance

export class GoogleDriveProvider implements Provider {
	private drive: drive_v3.Drive;
	private accessToken: string;
	private isEdgeRuntime: boolean;

	constructor(accessToken: string, isEdgeRuntime: boolean = false) {
		this.accessToken = accessToken;
		this.isEdgeRuntime = isEdgeRuntime;
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
				metadata.mimeType === "application/vnd.microsoft.folder" ||
				metadata.mimeType === "folder";

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
				// ! Note: when attempting to use the sdk, cloudflare envrionments error on upload. Using the api via fetch directly allows for uploads on cloudflare environments
				// ! Also, this code was made with AI
				if (this.isEdgeRuntime) {
					const initRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${this.accessToken}`,
							"Content-Type": "application/json; charset=UTF-8",
						},
						body: JSON.stringify(fileMetadata),
					});

					if (!initRes.ok) {
						const details = await initRes.text().catch(() => initRes.statusText);
						throw new Error(`Failed to initiate resumable upload. Status: ${initRes.status}. ${details}`);
					}

					const uploadUrl = initRes.headers.get("Location");
					if (!uploadUrl) {
						throw new Error("Resumable upload URL was not returned by Google Drive API");
					}

					let contentBuffer: Uint8Array;
					if (typeof Buffer !== "undefined" && Buffer.isBuffer(content)) {
						contentBuffer = new Uint8Array(content as Buffer);
					} else if (content instanceof Uint8Array) {
						contentBuffer = content;
					} else {
						const chunks: Uint8Array[] = [];
						for await (const chunk of content as NodeJS.ReadableStream) {
							chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
						}
						const total = chunks.reduce((n, c) => n + c.byteLength, 0);
						contentBuffer = new Uint8Array(total);
						let offset = 0;
						for (const c of chunks) {
							contentBuffer.set(c, offset);
							offset += c.byteLength;
						}
					}

					// Create a concrete ArrayBuffer to avoid SharedArrayBuffer typing issues
					const arrayBufferForBody = (() => {
						const ab = new ArrayBuffer(contentBuffer.byteLength);
						new Uint8Array(ab).set(contentBuffer);
						return ab;
					})();

					const uploadRes = await fetch(uploadUrl, {
						method: "PUT",
						headers: {
							"Content-Type": mimeType,
							"Content-Length": String(contentBuffer.byteLength),
						},
						body: arrayBufferForBody,
					});

					if (!uploadRes.ok) {
						const details = await uploadRes.text().catch(() => uploadRes.statusText);
						throw new Error(`Resumable upload failed. Status: ${uploadRes.status}. ${details}`);
					}

					const created: drive_v3.Schema$File = await uploadRes.json();
					return created ? this.mapToFile(created) : null;
				} else {
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
	async download(fileId: string, options?: DownloadFileSchema): Promise<DownloadResult | null> {
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
			let finalMimeType = fileMetadata.data.mimeType || "application/octet-stream";
			let filename = fileMetadata.data.name;

			if (isGoogleWorkspaceFile && options?.exportMimeType) {
				// For Google Workspace files, use export
				const response = await this.drive.files.export(
					{ fileId, mimeType: options.exportMimeType },
					{ responseType: "stream" }
				);
				finalMimeType = options.exportMimeType;
				filename = this.addFileExtension(filename, options.exportMimeType);

				// Convert stream to buffer
				const chunks: Buffer[] = [];
				for await (const chunk of response.data) {
					chunks.push(Buffer.from(chunk));
				}
				const buffer = Buffer.concat(chunks);

				return {
					data: buffer,
					filename,
					mimeType: finalMimeType,
					size: buffer.length,
				};
			}

			// For regular files, use the simple download approach
			const response = await this.drive.files.get(
				{
					fileId,
					alt: "media",
					acknowledgeAbuse: options?.acknowledgeAbuse,
				},
				{ responseType: "stream" }
			);

			// Convert stream to buffer
			const chunks: Buffer[] = [];
			for await (const chunk of response.data) {
				chunks.push(Buffer.from(chunk));
			}
			const buffer = Buffer.concat(chunks);

			return {
				data: buffer,
				filename,
				mimeType: finalMimeType,
				size: buffer.length,
			};
		} catch (error: any) {
			// Handle 403 acknowledgeAbuse error
			if (error.code === 403 && error.message?.includes("acknowledgeAbuse")) {
				const response = await this.drive.files.get(
					{
						fileId,
						alt: "media",
						acknowledgeAbuse: true,
					},
					{ responseType: "stream" }
				);

				// Convert stream to buffer
				const chunks: Buffer[] = [];
				for await (const chunk of response.data) {
					chunks.push(Buffer.from(chunk));
				}
				const buffer = Buffer.concat(chunks);

				return {
					data: buffer,
					filename: fileId, // Fallback filename since we don't have metadata
					mimeType: "application/octet-stream",
					size: buffer.length,
				};
			}

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
			folder: "application/vnd.google-apps.folder",
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
