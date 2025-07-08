import type { DriveInfo, File, FileMetadata, ListFilesOptions, ListFilesResult } from "@/providers/interface/types";
import { Client, ResponseType } from "@microsoft/microsoft-graph-client";
import { DEFAULT_MIME_TYPE, DEFAULT_SPACE } from "@/providers/helpers";
import type { DriveItem } from "@microsoft/microsoft-graph-types";
import type { Provider } from "../interface/provider";
import { Readable } from "node:stream";

export class OneDriveProvider implements Provider {
	private client: Client;
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
		this.client = Client.init({
			authProvider: done => {
				done(null, accessToken);
			},
		});
	}

	// ------------------------------------------------------------------------
	// Core CRUD Operations
	// ------------------------------------------------------------------------

	private readonly CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

	async create(metadata: FileMetadata, content?: Buffer | NodeJS.ReadableStream): Promise<File | null> {
		try {
			const isFolder =
				metadata.mimeType === "application/vnd.microsoft.folder" ||
				metadata.mimeType === "application/vnd.google-apps.folder";

			const item: DriveItem = {
				name: metadata.name,
				folder: isFolder ? {} : undefined,
				file: !isFolder ? {} : undefined,
				description: metadata.description,
			};

			const parentId = metadata.parentId || "root";
			const endpoint = `/me/drive/items/${parentId}/children`;

			// For folders or metadata-only files
			if (isFolder || !content) {
				const createdItem = await this.client
					.api(endpoint)
					.query({
						"@microsoft.graph.conflictBehavior": "rename",
					})
					.post(item);
				return createdItem ? this.mapToFile(createdItem) : null;
			}

			// For files with content
			const stream = this.normalizeContent(content);
			const contentBuffer = await this.streamToBuffer(stream);

			// Check if we need to use chunked upload
			if (contentBuffer.length <= this.CHUNK_SIZE) {
				// Small file upload (single chunk)
				const uploadPath =
					parentId === "root"
						? `/me/drive/root:/${encodeURIComponent(metadata.name)}:/content`
						: `/me/drive/items/${parentId}:/${encodeURIComponent(metadata.name)}:/content`;

				const uploadedItem = await this.client
					.api(uploadPath)
					.query({
						"@microsoft.graph.conflictBehavior": "rename",
					})
					.put(contentBuffer);

				return uploadedItem ? this.mapToFile(uploadedItem) : null;
			}

			// Large file upload (chunked)
			return await this.uploadLargeFile(metadata, contentBuffer, parentId);
		} catch (error) {
			console.error("Error creating file/folder:", error);
			throw error;
		}
	}

	private async uploadLargeFile(metadata: FileMetadata, contentBuffer: Buffer, parentId: string): Promise<File> {
		try {
			// 1. Create an upload session
			const uploadSession = await this.client
				.api(
					`/me/drive/${parentId === "root" ? "root" : `items/${parentId}`}:/${encodeURIComponent(metadata.name)}:/createUploadSession`
				)
				.query({
					"@microsoft.graph.conflictBehavior": "rename",
				})
				.post({
					item: {
						name: metadata.name,
					},
				});

			const uploadUrl = uploadSession.uploadUrl;
			const fileSize = contentBuffer.length;

			// 2. Upload file in chunks
			for (let offset = 0; offset < fileSize; offset += this.CHUNK_SIZE) {
				const chunk = contentBuffer.subarray(offset, offset + this.CHUNK_SIZE);
				const chunkSize = chunk.length;
				const end = Math.min(offset + chunkSize - 1, fileSize - 1);

				// Retry logic for each chunk
				let retries = 3;
				while (retries > 0) {
					try {
						await this.client
							.api(uploadUrl)
							.header("Content-Length", chunkSize.toString())
							.header("Content-Range", `bytes ${offset}-${end}/${fileSize}`)
							.put(chunk);
						break; // Success, exit retry loop
					} catch (error) {
						retries--;
						if (retries === 0) throw error;
						// Exponential backoff
						await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
					}
				}

				// Progress could be reported here
				const progress = Math.round(((end + 1) / fileSize) * 100);
				console.log(`Upload progress: ${progress}%`);
			}

			// 3. Get the uploaded item
			const response = await this.client.api(uploadUrl).get();
			if (response.file && response.file.hashes) {
				// File was uploaded completely
				const uploadedItem = await this.client.api(`/me/drive/items/${response.id}`).get();
				return this.mapToFile(uploadedItem);
			}

			throw new Error("File upload did not complete successfully");
		} catch (error) {
			console.error("Error in uploadLargeFile:", error);
			throw error;
		}
	}

	async getById(id: string): Promise<File | null> {
		try {
			const item = await this.client.api(`/me/drive/items/${id}`).get();
			return item ? this.mapToFile(item) : null;
		} catch (error) {
			if ((error as any).statusCode === 404) return null;
			throw error;
		}
	}

	async update(id: string, metadata: FileMetadata): Promise<File | null> {
		try {
			const updateData: DriveItem = {};

			if (metadata.name) updateData.name = metadata.name;
			if (metadata.description !== undefined) updateData.description = metadata.description;

			// Handle parent change if needed
			if (metadata.parentId) {
				await this.client.api(`/me/drive/items/${id}`).patch({
					parentReference: {
						id: metadata.parentId === "root" ? "root" : metadata.parentId,
					},
				});
			}

			const updatedItem = await this.client.api(`/me/drive/items/${id}`).patch(updateData);

			return updatedItem ? this.mapToFile(updatedItem) : null;
		} catch (error) {
			console.error("Error updating file/folder:", error);
			throw error;
		}
	}

	async delete(id: string, permanent: boolean = false): Promise<boolean> {
		try {
			if (permanent) {
				await this.client.api(`/me/drive/items/${id}`).delete();
			} else {
				await this.client.api(`/me/drive/items/${id}`).patch({
					deleted: {},
				});
			}
			return true;
		} catch (error) {
			if ((error as any).statusCode === 404) return false;
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// List Operations
	// ------------------------------------------------------------------------

	async listChildren(parentId: string = "root", options: ListFilesOptions = {}): Promise<ListFilesResult> {
		try {
			const query: Record<string, any> = {
				$top: options.pageSize || 100,
				$orderby: options.orderBy || "name",
			};

			if (options.pageToken) {
				query.$skipToken = options.pageToken;
			}

			const endpoint = parentId === "root" ? "/me/drive/root/children" : `/me/drive/items/${parentId}/children`;

			const response = await this.client.api(endpoint).query(query).get();

			return {
				items: response.value?.map((item: DriveItem) => this.mapToFile(item)) || [],
				nextPageToken: response["@odata.nextLink"],
			};
		} catch (error) {
			console.error("Error listing files:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// File Operations
	// ------------------------------------------------------------------------

	async download(id: string): Promise<Buffer | NodeJS.ReadableStream> {
		try {
			const response = await this.client.api(`/me/drive/items/${id}/content`).responseType(ResponseType.STREAM).get();

			return response;
		} catch (error) {
			console.error("Error downloading file:", error);
			throw error;
		}
	}

	async copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const response = await this.client.api(`/me/drive/items/${sourceId}/copy`).post({
				parentReference: {
					id: targetParentId === "root" ? "root" : targetParentId,
				},
				name: newName,
			});

			// The copy operation is async, so we need to wait for it to complete
			const operationId = response.headers["content-location"].split("operations/")[1];
			await this.waitForAsyncOperation(operationId);

			// Get the copied item
			const copiedItem = await this.client.api(`/me/drive/items/${sourceId}`).get();
			return this.mapToFile(copiedItem);
		} catch (error) {
			console.error("Error copying file/folder:", error);
			throw error;
		}
	}

	async move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const updateData: any = {
				parentReference: {
					id: targetParentId === "root" ? "root" : targetParentId,
				},
			};

			if (newName) {
				updateData.name = newName;
			}

			const updatedItem = await this.client.api(`/me/drive/items/${sourceId}`).patch(updateData);

			return updatedItem ? this.mapToFile(updatedItem) : null;
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
			const drive = await this.client.api("/me/drive").get();
			const quota = drive.quota;

			if (!quota) {
				throw new Error("Drive quota information not available");
			}

			return {
				totalSpace: quota.total || DEFAULT_SPACE,
				usedSpace: quota.used || DEFAULT_SPACE,
				trashSize: quota.deleted || DEFAULT_SPACE,
				trashItems: 0, // OneDrive doesn't provide this in the quota
				fileCount: 0, // OneDrive doesn't provide this in the quota
				state: "normal",
				providerMetadata: {
					driveType: drive.driveType,
					owner: drive.owner,
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
			const permissionData = {
				type: "view",
				scope: "anonymous",
				roles: [permission === "edit" ? "write" : "read"],
			};

			await this.client.api(`/me/drive/items/${id}/createLink`).post(permissionData);

			const item = await this.client.api(`/me/drive/items/${id}?select=webUrl`).get();

			return item.webUrl || null;
		} catch (error) {
			console.error("Error creating shareable link:", error);
			throw error;
		}
	}

	async search(query: string, options: Omit<ListFilesOptions, "filter"> = {}): Promise<ListFilesResult> {
		try {
			const response = await this.client
				.api(`/me/drive/root/search(q='${query}')`)
				.query({
					$top: options.pageSize || 100,
					...(options.pageToken && { $skipToken: options.pageToken }),
					$orderby: options.orderBy || "name",
				})
				.get();

			return {
				items: response.value?.map((item: DriveItem) => this.mapToFile(item)) || [],
				nextPageToken: response["@odata.nextLink"],
			};
		} catch (error) {
			console.error("Error searching files:", error);
			throw error;
		}
	}

	// ------------------------------------------------------------------------
	// Helper Methods
	// ------------------------------------------------------------------------

	private mapToFile(item: DriveItem): File {
		const isFolder = !!item.folder;
		const isShortcut = !!item.file?.mimeType?.includes("shortcut");
		const webContentLink: string | undefined = (item as any)["@microsoft.graph.downloadUrl"];

		return {
			id: item.id || "",
			name: item.name || "Untitled",
			type: isFolder ? "folder" : isShortcut ? "shortcut" : "file",
			mimeType: isFolder ? "application/vnd.microsoft.folder" : item.file?.mimeType || DEFAULT_MIME_TYPE,
			parentId: item.parentReference?.id || "root",
			size: item.size || 0,
			webViewLink: item.webUrl || undefined,
			webContentLink,
			createdTime: item.createdDateTime || new Date().toISOString(),
			modifiedTime: item.lastModifiedDateTime || new Date().toISOString(),
			description: item.description || undefined,
			trashed: !!item.deleted,
			providerMetadata: {
				...item,
			},
		};
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

	private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
			stream.on("error", err => reject(err));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
		});
	}

	private async waitForAsyncOperation(operationId: string, maxRetries: number = 10): Promise<void> {
		let retries = 0;

		while (retries < maxRetries) {
			const operation = await this.client.api(`/me/drive/operations/${operationId}`).get();

			if (operation.status === "completed") {
				return;
			} else if (operation.status === "failed") {
				throw new Error(`Async operation failed: ${operation.message}`);
			}

			await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next check
			retries++;
		}

		throw new Error("Async operation timed out");
	}

	public getAccessToken(): string {
		return this.accessToken;
	}

	public setAccessToken(token: string): void {
		this.accessToken = token;
		this.client = Client.init({
			authProvider: done => {
				done(null, token);
			},
		});
	}
}
