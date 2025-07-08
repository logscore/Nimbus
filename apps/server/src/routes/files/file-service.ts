import type { File } from "@/providers/interface/types";
import { TagService } from "@/routes/tags/tag-service";
import type { Session } from "@nimbus/auth/auth";
import { getDriveProvider } from "@/providers";
import type { Readable } from "node:stream";

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

	async listFiles(user: Session["user"], headers: Headers, options: ListFilesOptions) {
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

	async getFileById(user: Session["user"], headers: Headers, fileId: string, returnedValues?: string[]) {
		const drive = await getDriveProvider(user, headers);
		const file = await drive.getById(fileId, returnedValues);

		if (!file) {
			return null;
		}

		const tags = await this.tagService.getFileTags(fileId, user.id);
		return { ...file, tags } as File;
	}

	async updateFile(user: Session["user"], headers: Headers, fileId: string, updates: { name: string }) {
		const drive = await getDriveProvider(user, headers);
		return drive.update(fileId, updates);
	}

	async deleteFile(user: Session["user"], headers: Headers, fileId: string) {
		const drive = await getDriveProvider(user, headers);
		return drive.delete(fileId);
	}

	async createFile(user: Session["user"], headers: Headers, options: CreateFileOptions, fileStream?: Readable) {
		const drive = await getDriveProvider(user, headers);
		return drive.create(options, fileStream);
	}
}
