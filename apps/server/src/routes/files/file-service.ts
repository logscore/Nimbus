import type {
	DeleteFileSchema,
	DownloadFileSchema,
	File,
	GetFileByIdSchema,
	GetFilesSchema,
	UpdateFileSchema,
	Tag,
} from "@nimbus/shared";
import { getDriveProviderContext } from "../../hono";
import { TagService } from "../tags/tag-service";
import type { Readable } from "node:stream";

interface CreateFileOptions {
	name: string;
	mimeType: string;
	parentId?: string;
}

export class FileService {
	private tagService: TagService;
	private get c() {
		const context = getDriveProviderContext();
		if (!context) {
			throw new Error("Context is not available in TagService. It must be used within a request cycle.");
		}
		return context;
	}

	constructor() {
		this.tagService = new TagService();
	}

	async listFiles(options: GetFilesSchema) {
		const user = this.c.var.user;
		const drive = this.c.var.provider;
		const res = await drive.listChildren(options.parentId, {
			pageSize: options.pageSize,
			pageToken: options.pageToken,
			fields: options.returnedValues,
		});

		if (!res.items) {
			return null;
		}

		// Batch load tags for files to avoid N parallel queries
		const fileIds = res.items.map(i => i.id).filter((id): id is string => Boolean(id));
		let tagsByFileId: Record<string, Tag[]> = {};
		try {
			// Lazy import type to avoid circular import issues at top
			tagsByFileId = await this.tagService.getTagsByFileIds(fileIds, user.id);
		} catch (error) {
			console.error("Failed to batch get tags for files:", error);
		}

		const filesWithTags = res.items.map(item => {
			const tags = item.id ? (tagsByFileId[item.id] ?? []) : [];
			return { ...item, tags };
		});

		return filesWithTags as File[];
	}

	async getById(options: GetFileByIdSchema) {
		const user = this.c.var.user;
		const drive = this.c.var.provider;
		const file = await drive.getById(options.fileId, options.returnedValues);

		if (!file) {
			return null;
		}

		const tags = await this.tagService.getFileTags(options.fileId, user.id);
		return { ...file, tags } as File;
	}

	async updateFile(options: UpdateFileSchema) {
		const drive = this.c.var.provider;
		return drive.update(options.fileId, { name: options.name });
	}

	async deleteFile(options: DeleteFileSchema) {
		const drive = this.c.var.provider;
		return drive.delete(options.fileId);
	}

	async createFile(options: CreateFileOptions, fileStream?: Buffer<ArrayBuffer>) {
		const drive = this.c.var.provider;
		return drive.create(options, fileStream);
	}

	async downloadFile(options: DownloadFileSchema) {
		const drive = this.c.var.provider;
		return drive.download(options.fileId, options);
	}
}
