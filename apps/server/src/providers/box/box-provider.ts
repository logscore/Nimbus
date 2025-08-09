import {
	DEFAULT_MIME_TYPE,
	DEFAULT_PAGE_SIZE,
	type DownloadFileSchema,
	type DriveInfo,
	type File,
	type FileMetadata,
} from "@nimbus/shared";
import type { DownloadResult, ListFilesOptions, ListFilesResult } from "../interface/types";
import { getMimeTypeFromExtension } from "../utils/mime-types";
import type { Provider } from "../interface/provider";
import { Readable } from "node:stream";
import BoxSDK from "box-node-sdk";

interface BoxItem {
	id: string;
	name?: string;
	type: "file" | "folder";
	size?: string;
	parent?: {
		id: string;
	};
	created_at?: string;
	modified_at?: string;
	content_created_at?: string;
	content_modified_at?: string;
	extension?: string;
	shared_link?: {
		url?: string;
	};
}

interface BoxClient {
	files: {
		get(id: string, options?: any): Promise<BoxItem>;
		uploadFile(parentId: string, name: string, content: Readable, options?: any): Promise<{ entries: BoxItem[] }>;
		update(id: string, updates: any): Promise<BoxItem>;
		delete(id: string, permanent?: boolean): Promise<void>;
		copy(sourceId: string, targetParentId: string, options?: any): Promise<BoxItem>;
		getReadStream(id: string): Promise<Readable>;
	};
	folders: {
		get(id: string, options?: any): Promise<BoxItem>;
		create(parentId: string, name: string, options?: any): Promise<BoxItem>;
		getItems(parentId: string, options?: any): Promise<{ entries: BoxItem[]; total_count: number }>;
		update(id: string, updates: any): Promise<BoxItem>;
		delete(id: string, permanent?: boolean): Promise<void>;
		copy(sourceId: string, targetParentId: string, options?: any): Promise<BoxItem>;
	};
	users: {
		get(id: string, options?: any): Promise<{ space_amount?: number; space_used?: number }>;
	};
	search: {
		query(query: string, options?: any): Promise<{ entries: BoxItem[]; total_count: number }>;
	};
}

export class BoxProvider implements Provider {
	private client: BoxClient;
	private accessToken: string;
	private sdk?: BoxSDK;

	constructor(accessToken: string, clientID: string, clientSecret: string, client?: BoxClient) {
		this.accessToken = accessToken;

		// Use provided client (for testing/mocking) or create real SDK client
		if (client) {
			this.client = client;
		} else {
			// Prevent real SDK instantiation in test environments
			const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST === "true" || process.env.CI === "true";

			if (isTestEnv) {
				throw new Error("Box SDK should not be instantiated in test environment without explicit client injection");
			}

			this.sdk = new BoxSDK({
				clientID,
				clientSecret,
			});
			this.client = this.sdk.getBasicClient(accessToken) as BoxClient;
		}
	}

	async create(metadata: FileMetadata, content?: Buffer | Readable): Promise<File | null> {
		try {
			const parentId = this.normalizeParentId(metadata.parentId);
			const isFolder =
				metadata.mimeType === "application/vnd.google-apps.folder" ||
				metadata.mimeType === "application/vnd.microsoft.folder" ||
				metadata.mimeType === "application/x-directory";

			if (isFolder) {
				const folderData = await this.client.folders.create(parentId, metadata.name, {
					description: metadata.description,
				});

				return this.mapToFile(folderData);
			}

			if (!content) {
				throw new Error("Content is required for file creation");
			}

			let stream: Readable;
			if (Buffer.isBuffer(content)) {
				stream = Readable.from(content);
			} else {
				stream = content;
			}

			const uploadedFile = await this.client.files.uploadFile(parentId, metadata.name, stream, {
				content_type: metadata.mimeType || DEFAULT_MIME_TYPE,
				description: metadata.description,
			});

			const firstEntry = uploadedFile.entries[0];
			if (!firstEntry) {
				throw new Error("No file entry returned from Box upload");
			}
			return this.mapToFile(firstEntry);
		} catch (error) {
			console.error("Error creating Box item:", error);
			throw error;
		}
	}

	async getById(id: string, _fields?: string[]): Promise<File | null> {
		try {
			// Try to get as file first
			try {
				const fileData = await this.client.files.get(id, {
					fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				});
				return this.mapToFile(fileData);
			} catch {
				// If file fetch fails, try as folder
				const folderData = await this.client.folders.get(id, {
					fields:
						"id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,item_collection",
				});
				return this.mapToFile(folderData);
			}
		} catch (error) {
			const err = error as Error & { statusCode?: number };
			if (err.statusCode === 404) {
				return null;
			}
			console.error("Error getting Box item:", error);
			throw error;
		}
	}

	async update(id: string, metadata: Partial<FileMetadata>): Promise<File | null> {
		try {
			const existingFile = await this.getById(id);
			if (!existingFile) {
				return null;
			}

			const updates: Record<string, any> = {};
			if (metadata.name) updates.name = metadata.name;
			if (metadata.description) updates.description = metadata.description;

			if (existingFile.type === "folder") {
				const updatedFolder = await this.client.folders.update(id, updates);
				return this.mapToFile(updatedFolder);
			} else {
				const updatedFile = await this.client.files.update(id, updates);
				return this.mapToFile(updatedFile);
			}
		} catch (error) {
			console.error("Error updating Box item:", error);
			throw error;
		}
	}

	async delete(id: string, permanent = true): Promise<boolean> {
		try {
			const existingFile = await this.getById(id);
			if (!existingFile) {
				throw new Error(`File with id ${id} not found`);
			}

			if (existingFile.type === "folder") {
				await this.client.folders.delete(id, permanent);
			} else {
				await this.client.files.delete(id, permanent);
			}

			return true;
		} catch (error) {
			console.error("Error deleting Box item:", error);
			throw error;
		}
	}

	async listChildren(parentId = "0", options: ListFilesOptions = {}): Promise<ListFilesResult> {
		try {
			const normalizedParentId = this.normalizeParentId(parentId);
			const limit = options.pageSize || DEFAULT_PAGE_SIZE;
			const offset = options.pageToken ? parseInt(options.pageToken, 10) : 0;

			const folderItems = await this.client.folders.getItems(normalizedParentId, {
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
				limit,
				offset,
			});

			const items: File[] = folderItems.entries.map((item: BoxItem) => this.mapToFile(item));

			const nextPageToken = folderItems.total_count > offset + limit ? String(offset + limit) : undefined;

			return {
				items,
				nextPageToken,
			};
		} catch (error) {
			console.error("Error listing Box items:", error);
			throw error;
		}
	}

	async download(fileId: string, _options?: DownloadFileSchema): Promise<DownloadResult | null> {
		try {
			const fileInfo = await this.client.files.get(fileId, { fields: "name,size" });
			const stream = await this.client.files.getReadStream(fileId);

			const chunks: Buffer[] = [];
			for await (const chunk of stream) {
				chunks.push(chunk);
			}
			const data = Buffer.concat(chunks);

			return {
				data,
				filename: fileInfo.name || "download",
				mimeType: getMimeTypeFromExtension(fileInfo.name || ""),
				size: parseInt(fileInfo.size || "0", 10) || data.length,
			};
		} catch (error) {
			console.error("Error downloading Box file:", error);
			return null;
		}
	}

	async downloadStream(fileId: string): Promise<Readable | null> {
		try {
			const stream = await this.client.files.getReadStream(fileId);
			return stream;
		} catch (error) {
			console.error("Error streaming Box file:", error);
			return null;
		}
	}

	async copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const sourceFile = await this.getById(sourceId);
			if (!sourceFile) {
				return null;
			}

			const fileName = newName || `Copy of ${sourceFile.name}`;

			if (sourceFile.type === "folder") {
				const copiedFolder = await this.client.folders.copy(sourceId, targetParentId, { name: fileName });
				return this.mapToFile(copiedFolder);
			} else {
				const copiedFile = await this.client.files.copy(sourceId, targetParentId, { name: fileName });
				return this.mapToFile(copiedFile);
			}
		} catch (error) {
			console.error("Error copying Box item:", error);
			throw error;
		}
	}

	async move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const sourceFile = await this.getById(sourceId);
			if (!sourceFile) {
				return null;
			}

			const updates: Record<string, any> = { parent: { id: targetParentId } };
			if (newName) updates.name = newName;

			if (sourceFile.type === "folder") {
				const movedFolder = await this.client.folders.update(sourceId, updates);
				return this.mapToFile(movedFolder);
			} else {
				const movedFile = await this.client.files.update(sourceId, updates);
				return this.mapToFile(movedFile);
			}
		} catch (error) {
			console.error("Error moving Box item:", error);
			throw error;
		}
	}

	async getDriveInfo(): Promise<DriveInfo | null> {
		try {
			const userInfo = await this.client.users.get("me", { fields: "space_amount,space_used" });

			return {
				totalSpace: userInfo.space_amount || 0,
				usedSpace: userInfo.space_used || 0,
				trashSize: 0, // Box doesn't provide trash size in user info
				trashItems: 0,
				fileCount: 0, // Would need to iterate through all files to count
			};
		} catch (error) {
			console.error("Error getting Box user info:", error);
			return null;
		}
	}

	async getShareableLink(id: string, permission: "view" | "edit" = "view"): Promise<string | null> {
		try {
			const accessLevel = permission === "edit" ? "edit" : "view";
			const sharedLink = await this.client.files.update(id, {
				shared_link: {
					access: "open",
					permissions: {
						can_download: true,
						can_preview: true,
						can_edit: accessLevel === "edit",
					},
				},
			});

			return sharedLink.shared_link?.url || null;
		} catch (error) {
			console.error("Error creating Box shared link:", error);
			return null;
		}
	}

	async search(query: string, options: Omit<ListFilesOptions, "filter"> = {}): Promise<ListFilesResult> {
		try {
			const limit = options.pageSize || DEFAULT_PAGE_SIZE;
			const offset = options.pageToken ? parseInt(options.pageToken, 10) : 0;

			const searchResults = await this.client.search.query(query, {
				type: "file,folder",
				limit,
				offset,
				fields: "id,name,size,created_at,modified_at,content_created_at,content_modified_at,parent,type,extension",
			});

			const items: File[] = searchResults.entries.map((item: BoxItem) => this.mapToFile(item));
			const nextPageToken = searchResults.total_count > offset + limit ? String(offset + limit) : undefined;

			return {
				items,
				nextPageToken,
			};
		} catch (error) {
			console.error("Error searching Box items:", error);
			throw error;
		}
	}

	getAccessToken(): string {
		return this.accessToken;
	}

	setAccessToken(token: string): void {
		this.accessToken = token;
		if (this.sdk) {
			this.client = this.sdk.getBasicClient(token) as BoxClient;
		}
	}

	private normalizeParentId(id: string | null | undefined): string {
		const isRoot = !id || id === "root" || id === "/";
		return isRoot ? "0" : id;
	}

	private mapToFile(boxItem: BoxItem): File {
		const isFolder = boxItem.type === "folder";
		const parent = boxItem.parent;

		return {
			id: boxItem.id,
			name: boxItem.name || "Untitled",
			mimeType: isFolder ? "application/x-directory" : getMimeTypeFromExtension(boxItem.name || ""),
			size: isFolder ? 0 : parseInt(boxItem.size || "0", 10) || 0,
			parentId: this.normalizeParentId(parent?.id),
			createdTime: boxItem.created_at || boxItem.content_created_at || new Date().toISOString(),
			modifiedTime: boxItem.modified_at || boxItem.content_modified_at || new Date().toISOString(),
			type: isFolder ? ("folder" as const) : ("file" as const),
		};
	}
}
