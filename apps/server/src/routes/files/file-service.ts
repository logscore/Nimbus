import type {
	DeleteFileSchema,
	DownloadFileSchema,
	File,
	GetFileByIdSchema,
	GetFilesSchema,
	UpdateFileSchema,
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

		// Add tags to files, handling any tag retrieval failures
		const filesWithTags = await Promise.all(
			res.items.map(async item => {
				if (!item.id) return { ...item, tags: [] };
				try {
					const tags = await this.tagService.getFileTags(item.id, user.id);
					return { ...item, tags };
				} catch (error) {
					console.error(`Failed to get tags for file ${item.id}:`, error);
					return { ...item, tags: [] };
				}
			})
		);

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

	async createFile(options: CreateFileOptions, fileStream?: Readable) {
		const drive = this.c.var.provider;
		return drive.create(options, fileStream);
	}

	async downloadFile(options: DownloadFileSchema) {
		const drive = this.c.var.provider;
		return drive.download(options.fileId, options);
	}
}
