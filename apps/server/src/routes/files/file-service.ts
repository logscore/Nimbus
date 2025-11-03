import type {
	DeleteFileSchema,
	DownloadFileSchema,
	File,
	GetFileByIdSchema,
	GetFilesSchema,
	MoveFileSchema,
	UpdateFileSchema,
} from "@nimbus/shared";
import { getContext } from "hono/context-storage";
import { TagService } from "../tags/tag-service";
import type { HonoContext } from "../../hono";
import type { Readable } from "node:stream";

interface CreateFileOptions {
	name: string;
	mimeType: string;
	parentId?: string;
}

export class FileService {
	private tagService: TagService;

	private get user() {
		return getContext<HonoContext>().var.user;
	}

	private get provider() {
		return getContext<HonoContext>().var.provider;
	}

	constructor() {
		this.tagService = new TagService();
	}

	async listFiles(options: GetFilesSchema) {
		const res = await this.provider.listChildren(options.parentId, {
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
					const tags = await this.tagService.getFileTags(item.id, this.user!.id);
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
		const file = await this.provider.getById(options.fileId, options.returnedValues);

		if (!file) {
			return null;
		}

		const tags = await this.tagService.getFileTags(options.fileId, this.user!.id);
		return { ...file, tags } as File;
	}

	async updateFile(options: UpdateFileSchema) {
		return this.provider.update(options.fileId, { name: options.name });
	}

	async deleteFile(options: DeleteFileSchema) {
		return this.provider.delete(options.fileId);
	}

	async createFile(options: CreateFileOptions, fileStream?: Readable) {
		return this.provider.create(options, fileStream);
	}

	async downloadFile(options: DownloadFileSchema) {
		return this.provider.download(options.fileId, options);
	}

	async moveFile(options: MoveFileSchema) {
		return this.provider.move(options.sourceId, options.targetParentId, options.newName);
	}
}
