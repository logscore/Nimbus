import type {
	DeleteFileSchema,
	DownloadFileSchema,
	File,
	GetFileByIdSchema,
	GetFilesSchema,
	UpdateFileSchema,
} from "@nimbus/shared";
import type { SessionUser } from "@nimbus/auth/auth";
import { getDriveProvider } from "../../providers";
import { TagService } from "../tags/tag-service";
import type { Readable } from "node:stream";

export interface CreateFileOptions {
	name: string;
	mimeType: string;
	parentId?: string;
}

export class FileService {
	private tagService: TagService;

	constructor() {
		this.tagService = new TagService();
	}

	async listFiles(user: SessionUser, headers: Headers, options: GetFilesSchema) {
		const drive = await getDriveProvider(user, headers);
		const res = await drive.listChildren(options.parentId, {
			pageSize: options.pageSize,
			pageToken: options.pageToken,
			fields: options.returnedValues,
		});

		if (!res.items) {
			return null;
		}

		// Add tags to files
		const filesWithTags = await Promise.all(
			res.items.map(async item => {
				if (!item.id) return { ...item, tags: [] };
				const tags = await this.tagService.getFileTags(item.id, user.id);
				return { ...item, tags };
			})
		);

		return filesWithTags as File[];
	}

	async getById(user: SessionUser, headers: Headers, options: GetFileByIdSchema) {
		const drive = await getDriveProvider(user, headers);
		const file = await drive.getById(options.fileId, options.returnedValues);

		if (!file) {
			return null;
		}

		const tags = await this.tagService.getFileTags(options.fileId, user.id);
		return { ...file, tags } as File;
	}

	async updateFile(user: SessionUser, headers: Headers, options: UpdateFileSchema) {
		const drive = await getDriveProvider(user, headers);
		return drive.update(options.fileId, { name: options.name });
	}

	async deleteFile(user: SessionUser, headers: Headers, options: DeleteFileSchema) {
		const drive = await getDriveProvider(user, headers);
		return drive.delete(options.fileId);
	}

	async createFile(user: SessionUser, headers: Headers, options: CreateFileOptions, fileStream?: Readable) {
		const drive = await getDriveProvider(user, headers);
		return drive.create(options, fileStream);
	}

	async downloadFile(user: SessionUser, headers: Headers, options: DownloadFileSchema) {
		const drive = await getDriveProvider(user, headers);
		return drive.download(options.fileId, options);
	}
}
