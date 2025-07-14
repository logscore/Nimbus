import type { DownloadOptions } from "@/providers/interface/types";
import { TagService } from "@/routes/tags/tag-service";
import type { SessionUser } from "@nimbus/auth/auth";
import { getDriveProvider } from "@/providers";
import type { Readable } from "node:stream";
import type { File } from "@nimbus/shared";

export interface ListFilesOptions {
	parentId?: string;
	pageSize?: number;
	pageToken?: string;
	returnedValues?: string[];
}

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

	async listFiles(user: SessionUser, headers: Headers, options: ListFilesOptions) {
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

	async getById(user: SessionUser, headers: Headers, fileId: string, returnedValues?: string[]) {
		const drive = await getDriveProvider(user, headers);
		const file = await drive.getById(fileId, returnedValues);

		if (!file) {
			return null;
		}

		const tags = await this.tagService.getFileTags(fileId, user.id);
		return { ...file, tags } as File;
	}

	async updateFile(user: SessionUser, headers: Headers, fileId: string, updates: { name: string }) {
		const drive = await getDriveProvider(user, headers);
		return drive.update(fileId, updates);
	}

	async deleteFile(user: SessionUser, headers: Headers, fileId: string) {
		const drive = await getDriveProvider(user, headers);
		return drive.delete(fileId);
	}

	async createFile(user: SessionUser, headers: Headers, options: CreateFileOptions, fileStream?: Readable) {
		const drive = await getDriveProvider(user, headers);
		return drive.create(options, fileStream);
	}

	async downloadFile(user: SessionUser, headers: Headers, fileId: string, options?: DownloadOptions) {
		const drive = await getDriveProvider(user, headers);
		return drive.download(fileId, options);
	}
}
