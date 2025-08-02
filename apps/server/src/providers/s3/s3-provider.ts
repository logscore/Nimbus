import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	paginateListObjectsV2,
	PutObjectCommand,
	S3Client,
	type GetObjectCommandOutput,
	type HeadObjectCommandOutput,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import {
	DEFAULT_MIME_TYPE,
	DEFAULT_PAGE_SIZE,
	type DownloadFileSchema,
	type DriveInfo,
	type File,
	type FileMetadata,
} from "@nimbus/shared";
import type { DownloadResult, ListFilesOptions, ListFilesResult } from "../interface/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Provider } from "../interface/provider";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";

interface S3Config {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	bucketName: string;
	endpoint?: string;
	forcePathStyle?: boolean;
}

export class S3Provider implements Provider {
	private s3: S3Client;
	private bucketName: string;
	private accessToken: string; // Store for interface compatibility

	constructor(config: S3Config) {
		// Store a reference instead of raw credentials for security
		this.accessToken = Buffer.from(`${config.accessKeyId}:${Date.now()}`).toString("base64");
		this.bucketName = config.bucketName;

		this.s3 = new S3Client({
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
			...(config.endpoint && {
				endpoint: config.endpoint,
				// Default to false. Added this for localstack compatibility
				forcePathStyle: config.forcePathStyle || false,
			}),
		});
	}

	async create(metadata: FileMetadata, content?: Buffer | Readable): Promise<File | null> {
		try {
			const key = this.buildKey(metadata.parentId || "", metadata.name);
			const isFolder =
				metadata.mimeType === "application/vnd.google-apps.folder" ||
				metadata.mimeType === "application/vnd.microsoft.folder";

			if (isFolder) {
				// S3 folders are simulated using zero-byte objects with trailing slash
				const folderKey = key.endsWith("/") ? key : `${key}/`;
				await this.s3.send(
					new PutObjectCommand({
						Bucket: this.bucketName,
						Key: folderKey,
						Body: "",
						ContentType: "application/x-directory",
					})
				);

				return {
					id: folderKey,
					name: metadata.name,
					mimeType: "application/x-directory",
					size: 0,
					parentId: metadata.parentId || "",
					createdTime: new Date().toISOString(),
					modifiedTime: new Date().toISOString(),
					type: "folder" as const,
				};
			}

			if (!content) {
				throw new Error("Content is required for file creation");
			}

			const mimeType = metadata.mimeType || DEFAULT_MIME_TYPE;

			// For streams, use multipart upload to handle large files efficiently
			if (content instanceof Readable) {
				const upload = new Upload({
					client: this.s3,
					params: {
						Bucket: this.bucketName,
						Key: key,
						Body: content,
						ContentType: mimeType,
						...(metadata.description && {
							Metadata: { description: metadata.description },
						}),
					},
				});
				await upload.done();
			} else {
				// For buffers, use regular upload
				const params: PutObjectCommandInput = {
					Bucket: this.bucketName,
					Key: key,
					Body: content,
					ContentType: mimeType,
					...(metadata.description && {
						Metadata: { description: metadata.description },
					}),
				};
				await this.s3.send(new PutObjectCommand(params));
			}

			// Get the created object to return full file info
			const file = await this.getById(key);
			return file;
		} catch (error) {
			console.error("Error creating S3 object:", error);
			throw error;
		}
	}

	async getById(id: string, _fields?: string[]): Promise<File | null> {
		try {
			const command = new HeadObjectCommand({
				Bucket: this.bucketName,
				Key: id,
			});

			const response = await this.s3.send(command);
			return this.mapToFile(id, response);
		} catch (error) {
			const err = error as Error & { name?: string; $metadata?: { httpStatusCode?: number } };
			if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
				return null;
			}
			console.error("Error getting S3 object:", error);
			throw error;
		}
	}

	async update(id: string, metadata: Partial<FileMetadata>): Promise<File | null> {
		try {
			// S3 requires copying object to update metadata
			const existingFile = await this.getById(id);
			if (!existingFile) {
				return null;
			}

			const newKey = metadata.name ? this.buildKey(existingFile.parentId || "", metadata.name) : id;

			if (newKey !== id) {
				await this.s3.send(
					new CopyObjectCommand({
						Bucket: this.bucketName,
						CopySource: encodeURIComponent(`${this.bucketName}/${id}`),
						Key: newKey,
						...(metadata.description && {
							Metadata: { description: metadata.description },
							MetadataDirective: "REPLACE",
						}),
					})
				);

				await this.s3.send(
					new DeleteObjectCommand({
						Bucket: this.bucketName,
						Key: id,
					})
				);

				return this.getById(newKey);
			}

			// Update metadata by copying object to itself
			await this.s3.send(
				new CopyObjectCommand({
					Bucket: this.bucketName,
					CopySource: encodeURIComponent(`${this.bucketName}/${id}`),
					Key: id,
					Metadata: {
						...(metadata.description && { description: metadata.description }),
					},
					MetadataDirective: "REPLACE",
				})
			);

			return this.getById(id);
		} catch (error) {
			console.error("Error updating S3 object:", error);
			throw error;
		}
	}

	async delete(id: string, _permanent = true): Promise<boolean> {
		try {
			if (id.endsWith("/")) {
				const paginator = paginateListObjectsV2({ client: this.s3 }, { Bucket: this.bucketName, Prefix: id });

				for await (const page of paginator) {
					if (page.Contents) {
						for (const object of page.Contents) {
							if (object.Key) {
								await this.s3.send(
									new DeleteObjectCommand({
										Bucket: this.bucketName,
										Key: object.Key,
									})
								);
							}
						}
					}
				}
			} else {
				await this.s3.send(
					new DeleteObjectCommand({
						Bucket: this.bucketName,
						Key: id,
					})
				);
			}

			return true;
		} catch (error) {
			console.error("Error deleting S3 object:", error);
			return false;
		}
	}

	async listChildren(parentId = "", options: ListFilesOptions = {}): Promise<ListFilesResult> {
		try {
			// Handle root directory - treat "root", "/", or empty string as bucket root
			const normalizedParentId = !parentId || parentId === "root" || parentId === "/" ? "" : parentId;
			const prefix = normalizedParentId
				? normalizedParentId.endsWith("/")
					? normalizedParentId
					: `${normalizedParentId}/`
				: "";
			const delimiter = "/";

			const command = new ListObjectsV2Command({
				Bucket: this.bucketName,
				Prefix: prefix,
				Delimiter: delimiter,
				MaxKeys: options.pageSize || DEFAULT_PAGE_SIZE,
				ContinuationToken: options.pageToken,
			});

			const response = await this.s3.send(command);
			const items: File[] = [];

			if (response.CommonPrefixes) {
				for (const folder of response.CommonPrefixes) {
					if (folder.Prefix && folder.Prefix !== prefix) {
						const folderName = folder.Prefix.replace(prefix, "").replace("/", "");
						items.push({
							id: folder.Prefix,
							name: folderName,
							mimeType: "application/x-directory",
							size: 0,
							parentId: parentId,
							createdTime: new Date().toISOString(),
							modifiedTime: new Date().toISOString(),
							type: "folder" as const,
						});
					}
				}
			}

			// Add files
			if (response.Contents) {
				for (const object of response.Contents) {
					if (object.Key && object.Key !== prefix && !object.Key.endsWith("/")) {
						const fileName = object.Key.replace(prefix, "");
						if (!fileName.includes("/")) {
							items.push({
								id: object.Key,
								name: fileName,
								mimeType: this.getMimeTypeFromKey(object.Key),
								size: object.Size || 0,
								parentId: parentId,
								createdTime: object.LastModified?.toISOString() || new Date().toISOString(),
								modifiedTime: object.LastModified?.toISOString() || new Date().toISOString(),
								type: "file" as const,
							});
						}
					}
				}
			}

			return {
				items,
				nextPageToken: response.NextContinuationToken,
			};
		} catch (error) {
			console.error("Error listing S3 objects:", error);
			throw error;
		}
	}

	async download(fileId: string, _options?: DownloadFileSchema): Promise<DownloadResult | null> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: fileId,
			});

			const response: GetObjectCommandOutput = await this.s3.send(command);

			if (!response.Body) {
				return null;
			}

			const data = await this.streamToBuffer(response.Body as Readable);
			const fileName = fileId.split("/").pop() || fileId;

			return {
				data,
				filename: fileName,
				mimeType: response.ContentType || DEFAULT_MIME_TYPE,
				size: response.ContentLength || data.length,
			};
		} catch (error) {
			console.error("Error downloading S3 object:", error);
			return null;
		}
	}

	// Stream download for large files to avoid memory issues
	async downloadStream(fileId: string): Promise<Readable | null> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: fileId,
			});
			const response = await this.s3.send(command);
			return response.Body as Readable;
		} catch (error) {
			console.error("Error streaming S3 object:", error);
			return null;
		}
	}

	async copy(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const sourceName = sourceId.split("/").pop() || sourceId;
			const fileName = newName || `Copy of ${sourceName}`;
			const targetKey = this.buildKey(targetParentId, fileName);

			await this.s3.send(
				new CopyObjectCommand({
					Bucket: this.bucketName,
					CopySource: encodeURIComponent(`${this.bucketName}/${sourceId}`),
					Key: targetKey,
				})
			);

			return this.getById(targetKey);
		} catch (error) {
			console.error("Error copying S3 object:", error);
			throw error;
		}
	}

	async move(sourceId: string, targetParentId: string, newName?: string): Promise<File | null> {
		try {
			const copied = await this.copy(sourceId, targetParentId, newName);
			if (copied) {
				await this.delete(sourceId);
			}
			return copied;
		} catch (error) {
			console.error("Error moving S3 object:", error);
			throw error;
		}
	}

	async getDriveInfo(): Promise<DriveInfo | null> {
		try {
			// Verify bucket exists
			await this.s3.send(new HeadBucketCommand({ Bucket: this.bucketName }));

			// Calculate actual usage
			let totalSize = 0;
			let fileCount = 0;

			const paginator = paginateListObjectsV2({ client: this.s3 }, { Bucket: this.bucketName });

			for await (const page of paginator) {
				if (page.Contents) {
					fileCount += page.Contents.length;
					totalSize += page.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
				}
			}

			return {
				totalSpace: 0, // S3 doesn't have quotas by default
				usedSpace: totalSize,
				trashSize: 0,
				trashItems: 0,
				fileCount,
			};
		} catch (error) {
			console.error("Error getting S3 bucket info:", error);
			return null;
		}
	}

	async getShareableLink(id: string, _permission: "view" | "edit" = "view"): Promise<string | null> {
		try {
			// S3 pre-signed URLs for file sharing (valid for 1 hour)
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: id,
			});

			// Note: S3 doesn't have granular view/edit permissions like Google Drive
			// All pre-signed URLs provide download access
			const signedUrl = await getSignedUrl(this.s3, command, {
				expiresIn: 3600, // 1 hour
			});

			return signedUrl;
		} catch (error) {
			console.error("Error generating S3 pre-signed URL:", error);
			return null;
		}
	}

	async search(query: string, options: Omit<ListFilesOptions, "filter"> = {}): Promise<ListFilesResult> {
		// Note: S3 doesn't support native search, so this lists all objects and filters client-side
		// This can be slow and expensive for large buckets
		try {
			const command = new ListObjectsV2Command({
				Bucket: this.bucketName,
				MaxKeys: options.pageSize || DEFAULT_PAGE_SIZE,
				ContinuationToken: options.pageToken,
			});

			const response = await this.s3.send(command);
			const items: File[] = [];

			if (response.Contents) {
				for (const object of response.Contents) {
					if (object.Key && object.Key.toLowerCase().includes(query.toLowerCase())) {
						const fileName = object.Key.split("/").pop() || object.Key;
						const parentPath = object.Key.substring(0, object.Key.lastIndexOf("/"));

						items.push({
							id: object.Key,
							name: fileName,
							mimeType: this.getMimeTypeFromKey(object.Key),
							size: object.Size || 0,
							parentId: parentPath,
							createdTime: object.LastModified?.toISOString() || new Date().toISOString(),
							modifiedTime: object.LastModified?.toISOString() || new Date().toISOString(),
							type: object.Key.endsWith("/") ? ("folder" as const) : ("file" as const),
						});
					}
				}
			}

			return {
				items,
				nextPageToken: response.NextContinuationToken,
			};
		} catch (error) {
			console.error("Error searching S3 objects:", error);
			throw error;
		}
	}

	getAccessToken(): string {
		return this.accessToken;
	}

	setAccessToken(_token: string): void {
		throw new Error("S3Provider does not support dynamic credential updates. Create a new instance instead.");
	}

	private buildKey(parentId: string, name: string): string {
		// Handle root directory - treat "root", "/", or empty string as bucket root
		if (!parentId || parentId === "root" || parentId === "/") {
			return name;
		}
		const prefix = parentId.endsWith("/") ? parentId : `${parentId}/`;
		return `${prefix}${name}`;
	}

	private mapToFile(key: string, response: HeadObjectCommandOutput): File {
		const fileName = key.split("/").pop() || key;
		const parentPath = key.substring(0, key.lastIndexOf("/"));

		return {
			id: key,
			name: fileName,
			mimeType: response.ContentType || this.getMimeTypeFromKey(key),
			size: response.ContentLength || 0,
			parentId: parentPath,
			createdTime: response.LastModified?.toISOString() || new Date().toISOString(),
			modifiedTime: response.LastModified?.toISOString() || new Date().toISOString(),
			type: key.endsWith("/") ? ("folder" as const) : ("file" as const),
		};
	}

	private getMimeTypeFromKey(key: string): string {
		const extension = key.split(".").pop()?.toLowerCase();
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
			// Documents
			doc: "application/msword",
			docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			xls: "application/vnd.ms-excel",
			xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			ppt: "application/vnd.ms-powerpoint",
			pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			// Code
			js: "application/javascript",
			json: "application/json",
			html: "text/html",
			css: "text/css",
			// Media
			webm: "video/webm",
			avi: "video/x-msvideo",
			wav: "audio/wav",
			// Archives
			tar: "application/x-tar",
			gz: "application/gzip",
			rar: "application/vnd.rar",
		};
		return mimeTypes[extension || ""] || DEFAULT_MIME_TYPE;
	}

	private async streamToBuffer(stream: Readable): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on("data", chunk => chunks.push(chunk));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
			stream.on("error", reject);
		});
	}
}
