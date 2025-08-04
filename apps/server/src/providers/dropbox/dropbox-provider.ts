import {
	DEFAULT_MIME_TYPE,
	DEFAULT_PAGE_SIZE,
	type DownloadFileSchema,
	type DriveInfo,
	type File,
	type FileMetadata,
} from "@nimbus/shared";
import type { DownloadResult, ListFilesOptions, ListFilesResult } from "../interface/types";
import type { Provider } from "../interface/provider";
import { Readable } from "node:stream";
import type { files } from "dropbox";
import { Dropbox } from "dropbox";

type DropboxMetadata = files.FileMetadataReference | files.FolderMetadataReference;

/**
 * Dropbox provider implementation for cloud storage integration.
 * Uses Dropbox API v2 for file operations with path-based identification.
 */
export class DropboxProvider implements Provider {
	private client: Dropbox;
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
		this.client = new Dropbox({ accessToken });
	}

	async create(metadata: FileMetadata, content?: Buffer | Readable): Promise<File | null> {
		const parentPath = this.normalizeParentPath(metadata.parentId);
		const fullPath = this.joinPath(parentPath, metadata.name);

		const isFolder =
			metadata.mimeType === "application/vnd.google-apps.folder" ||
			metadata.mimeType === "application/vnd.microsoft.folder" ||
			metadata.mimeType === "application/x-directory";

		if (isFolder) {
			const folderData = await this.client.filesCreateFolderV2({
				path: fullPath,
				autorename: false,
			});
			return this.mapToFile(folderData.result.metadata as files.FolderMetadataReference);
		}

		if (!content) {
			throw new Error("Content is required for file upload");
		}

		const fileContent = Buffer.isBuffer(content) ? content : await this.streamToBuffer(content);

		const fileData = await this.client.filesUpload({
			path: fullPath,
			contents: fileContent,
			mode: { ".tag": "add" },
			autorename: false,
		});

		return this.mapToFile(fileData.result as files.FileMetadataReference);
	}

	async getById(id: string): Promise<File | null> {
		try {
			const metadata = await this.client.filesGetMetadata({
				path: id,
				include_media_info: false,
				include_deleted: false,
			});

			return this.mapToFile(metadata.result as DropboxMetadata);
		} catch {
			return null;
		}
	}

	async update(id: string, metadata: FileMetadata): Promise<File | null> {
		const parentPath = this.normalizeParentPath(metadata.parentId);
		const newPath = this.joinPath(parentPath, metadata.name);

		const moveData = await this.client.filesMoveV2({
			from_path: id,
			to_path: newPath,
			autorename: false,
		});

		return this.mapToFile(moveData.result.metadata as DropboxMetadata);
	}

	async delete(id: string, _permanent = true): Promise<boolean> {
		await this.client.filesDeleteV2({
			path: id,
		});
		return true;
	}

	async listChildren(parentId = "", options: ListFilesOptions = {}): Promise<ListFilesResult> {
		const normalizedPath = this.normalizeParentPath(parentId);
		const limit = Math.min(options.pageSize || DEFAULT_PAGE_SIZE, 2000);

		let listResult;
		if (options.pageToken) {
			listResult = await this.client.filesListFolderContinue({
				cursor: options.pageToken,
			});
		} else {
			listResult = await this.client.filesListFolder({
				path: normalizedPath,
				recursive: false,
				include_media_info: false,
				include_deleted: false,
				include_has_explicit_shared_members: false,
				limit,
			});
		}

		const items = listResult.result.entries.map(item => this.mapToFile(item as DropboxMetadata));

		return {
			items,
			nextPageToken: listResult.result.has_more ? listResult.result.cursor : undefined,
		};
	}

	async download(fileId: string, _options?: DownloadFileSchema): Promise<DownloadResult | null> {
		try {
			const downloadData = await this.client.filesDownload({
				path: fileId,
			});

			const fileBuffer = (downloadData.result as any).fileBinary as Buffer;

			return {
				data: fileBuffer,
				filename: downloadData.result.name,
				mimeType: this.getMimeTypeFromExtension(downloadData.result.name),
				size: downloadData.result.size || 0,
			};
		} catch {
			return null;
		}
	}

	async copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		const targetPath = this.normalizeParentPath(targetParentId);
		const sourceName = this.getNameFromPath(sourceId);
		const fileName = newName || sourceName;
		const fullTargetPath = this.joinPath(targetPath, fileName);

		const copyData = await this.client.filesCopyV2({
			from_path: sourceId,
			to_path: fullTargetPath,
			autorename: false,
		});

		return this.mapToFile(copyData.result.metadata as DropboxMetadata);
	}

	async move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		const targetPath = this.normalizeParentPath(targetParentId);
		const sourceName = this.getNameFromPath(sourceId);
		const fileName = newName || sourceName;
		const fullTargetPath = this.joinPath(targetPath, fileName);

		const moveData = await this.client.filesMoveV2({
			from_path: sourceId,
			to_path: fullTargetPath,
			autorename: false,
		});

		return this.mapToFile(moveData.result.metadata as DropboxMetadata);
	}

	async getDriveInfo(): Promise<DriveInfo | null> {
		try {
			const spaceUsage = await this.client.usersGetSpaceUsage();
			const used = spaceUsage.result.used;
			const allocation = spaceUsage.result.allocation;

			let total = 0;
			if (allocation[".tag"] === "individual") {
				total = allocation.allocated;
			} else if (allocation[".tag"] === "team") {
				total = allocation.allocated;
			}

			return {
				totalSpace: total,
				usedSpace: used,
				trashSize: 0,
				trashItems: 0,
				fileCount: 0,
				state: "normal",
			};
		} catch {
			return null;
		}
	}

	async getShareableLink(fileId: string, _options?: any): Promise<string | null> {
		try {
			const linkResult = await this.client.sharingCreateSharedLinkWithSettings({
				path: fileId,
				settings: {
					requested_visibility: { ".tag": "public" },
					audience: { ".tag": "public" },
					access: { ".tag": "viewer" },
				},
			});

			return linkResult.result.url;
		} catch {
			return null;
		}
	}

	async search(query: string, options: ListFilesOptions = {}): Promise<ListFilesResult> {
		const limit = Math.min(options.pageSize || DEFAULT_PAGE_SIZE, 1000);

		const searchResult = await this.client.filesSearchV2({
			query,
			options: {
				path: "",
				max_results: limit,
				order_by: { ".tag": "relevance" },
				file_status: { ".tag": "active" },
				filename_only: false,
			},
		});

		const items = searchResult.result.matches
			.map(match => {
				if (match.metadata[".tag"] === "metadata") {
					return match.metadata.metadata;
				}
				return null;
			})
			.filter(item => item !== null)
			.map(item => this.mapToFile(item as DropboxMetadata));

		return {
			items,
			nextPageToken: searchResult.result.has_more ? searchResult.result.cursor : undefined,
		};
	}

	getAccessToken(): string {
		return this.accessToken;
	}

	setAccessToken(token: string): void {
		this.accessToken = token;
		this.client = new Dropbox({ accessToken: token });
	}

	private mapToFile(dropboxItem: DropboxMetadata): File {
		const isFolder = dropboxItem[".tag"] === "folder";
		const path = dropboxItem.path_display || dropboxItem.path_lower || "";
		const name = dropboxItem.name || "";

		const size = isFolder ? 0 : dropboxItem[".tag"] === "file" ? dropboxItem.size || 0 : 0;
		const createdTime = isFolder ? undefined : dropboxItem[".tag"] === "file" ? dropboxItem.client_modified : undefined;
		const modifiedTime = isFolder
			? undefined
			: dropboxItem[".tag"] === "file"
				? dropboxItem.server_modified
				: undefined;

		return {
			id: path,
			name,
			mimeType: isFolder ? "application/x-directory" : this.getMimeTypeFromExtension(name),
			size,
			createdTime: createdTime || new Date().toISOString(),
			modifiedTime: modifiedTime || new Date().toISOString(),
			type: isFolder ? "folder" : "file",
			parentId: this.getParentPath(path),
			trashed: false,
		};
	}

	private normalizeParentPath(parentId?: string): string {
		if (!parentId || parentId === "root" || parentId === "/" || parentId === "") {
			return "";
		}
		const normalized = parentId.startsWith("/") ? parentId : `/${parentId}`;
		return normalized.endsWith("/") && normalized !== "/" ? normalized.slice(0, -1) : normalized;
	}

	private joinPath(parentPath: string, name: string): string {
		if (parentPath === "" || parentPath === "/") {
			return `/${name}`;
		}
		return `${parentPath}/${name}`;
	}

	private getParentPath(fullPath: string): string {
		if (!fullPath || fullPath === "/") return "";
		const parts = fullPath.split("/");
		parts.pop();
		const parentPath = parts.join("/");
		return parentPath === "" ? "" : parentPath;
	}

	private getNameFromPath(path: string): string {
		if (!path || path === "/") return "";
		return path.split("/").pop() || "";
	}

	private async streamToBuffer(stream: Readable): Promise<Buffer> {
		const chunks: Buffer[] = [];
		return new Promise((resolve, reject) => {
			stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
			stream.on("error", reject);
		});
	}

	private getMimeTypeFromExtension(filename: string): string {
		const extension = filename.split(".").pop()?.toLowerCase();
		const mimeTypes: Record<string, string> = {
			txt: "text/plain",
			pdf: "application/pdf",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			gif: "image/gif",
			mp4: "video/mp4",
			mp3: "audio/mpeg",
			zip: "application/zip",
			doc: "application/msword",
			docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			xls: "application/vnd.ms-excel",
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			ppt: "application/vnd.ms-powerpoint",
			pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			js: "application/javascript",
			json: "application/json",
			html: "text/html",
			css: "text/css",
			webm: "video/webm",
			avi: "video/x-msvideo",
			wav: "audio/wav",
			tar: "application/x-tar",
			gz: "application/gzip",
			rar: "application/vnd.rar",
		};
		return mimeTypes[extension || ""] || DEFAULT_MIME_TYPE;
	}
}
