import type { File as OneDriveFile } from "@/providers/microsoft/types";
import { OneDrive } from "@nimbus/server/lib/one-drive/src/client";
import type { Provider } from "@/providers/interface/provider";
import type { File } from "../interface/types";

export class OneDriveProvider implements Provider {
	private drive: OneDrive;
	private accessToken: string;

	constructor(drive: OneDrive, accessToken: string) {
		this.drive = drive;
		this.accessToken = accessToken;
	}

	// Create file or folder
	async createFile(name: string, mimeType: string, parent: string): Promise<File | null> {
		const parentId = parent || "root";

		const res: Response = await this.drive.post(`/me/drive/items/${parentId}/children`, {
			body: {
				name,
				folder: mimeType === "application/vnd.microsoft.folder" ? {} : undefined,
				file: mimeType !== "application/vnd.microsoft.folder" ? {} : undefined,
			},
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	async listFiles(): Promise<File[]> {
		const res: Response = await this.drive.get(`/me/drive/root/children`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return [];
		}

		const data = (await res.json()) as { value: OneDriveFile[] };
		const files: File[] = data.value.map(file => convertOneDriveFileToProviderFile(file));
		return files;
	}

	async getFileById(id: string): Promise<File | null> {
		const res: Response = await this.drive.get(`/me/drive/items/${id}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	async updateFile(fileId: string, name: string): Promise<File | null> {
		const res: Response = await this.drive.patch(`/me/drive/items/${fileId}`, {
			body: { name },
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as OneDriveFile;
		const file: File = convertOneDriveFileToProviderFile(data);
		return file;
	}

	async deleteFile(fileId: string): Promise<boolean> {
		const res: Response = await this.drive.delete(`/me/drive/items/${fileId}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		return res.status === 204;
	}
}

function convertOneDriveFileToProviderFile(file: OneDriveFile): File {
	return {
		id: file.id,
		name: file.name,
		size: file.size?.toString() ?? null,
		creationDate: file.createdDateTime ?? null,
		modificationDate: file.lastModifiedDateTime ?? null,
	};
}
