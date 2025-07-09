import {
	createFileSchema,
	deleteFileSchema,
	getFileByIdSchema,
	getFilesSchema,
	updateFileSchema,
	uploadFileSchema,
	MAX_FILE_SIZE,
	ALLOWED_MIME_TYPES,
} from "@/validators";
import {
	fileDeleteRateLimiter,
	fileGetRateLimiter,
	fileUpdateRateLimiter,
	fileUploadRateLimiter,
} from "@nimbus/cache/rate-limiters";
import type { ApiResponse, UploadedFile } from "@/routes/types";
import type { File } from "@/providers/interface/types";
import { TagService } from "@/routes/tags/tag-service";
import { getDriveManagerForUser } from "@/providers";
import { securityMiddleware } from "@/middleware";
import { type Session } from "@nimbus/auth/auth";
import { Readable } from "node:stream";
import type { Context } from "hono";
import { Hono } from "hono";

const filesRouter = new Hono();
const tagService = new TagService();

filesRouter.get(
	"/",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileGetRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		const { data, error } = getFilesSchema.safeParse({
			parentId: c.req.query("parentId"),
			pageSize: c.req.query("pageSize"),
			returnedValues: c.req.queries("returnedValues[]"),
			pageToken: c.req.query("pageToken") ?? undefined,
		});

		if (error) {
			return c.json<ApiResponse>({ success: false, message: error.errors[0]?.message }, 400);
		}

		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const res = await drive.listFiles(data.parentId, data.pageSize, data.returnedValues, data.pageToken);

		if (!res.files) {
			return c.json<ApiResponse>({ success: false, message: "Files not found" }, 404);
		}

		// Add tags to files
		const filesWithTags = await Promise.all(
			res.files.map(async file => {
				if (!file.id) return { ...file, tags: [] };
				const tags = await tagService.getFileTags(file.id, user.id);
				return { ...file, tags };
			})
		);

		return c.json(filesWithTags as File[]);
	}
);

// Get a specific file from
// TODO: Grab fileId from url path, not the params
filesRouter.get(
	"/:id",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileGetRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		// Validation
		const { error, data } = getFileByIdSchema.safeParse(c.req.param());
		if (error) {
			return c.json<ApiResponse>({ success: false, message: error.errors[0]?.message }, 400);
		}

		const fileId = data.fileId;
		if (!fileId) {
			return c.json<ApiResponse>({ success: false, message: "File ID not provided" }, 400);
		}

		const returnedValues = data.returnedValues;

		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const file = await drive.getFileById(fileId, returnedValues);
		if (!file) {
			return c.json<ApiResponse>({ success: false, message: "File not found" }, 404);
		}

		// Add tags to file to be displayed
		const tags = await tagService.getFileTags(fileId, user.id);
		const fileWithTags = { ...file, tags };

		return c.json<File>(fileWithTags);
	}
);

// TODO: Note that the validation only works for renaming, this will need to be updated as we support more update features
filesRouter.put(
	"/",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileUpdateRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		const fileId = c.req.query("fileId");
		const reqName = (await c.req.json()).name;

		// Validation
		const { error, data } = updateFileSchema.safeParse({ fileId, name: reqName });
		if (error) {
			return c.json<ApiResponse>({ success: false, message: error.errors[0]?.message }, 400);
		}

		const id = data.fileId;
		const name = data.name;

		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const success = await drive.updateFile(id, name);

		if (!success) {
			return c.json<ApiResponse>({ success: false, message: "Failed to update file" }, 500);
		}

		return c.json<ApiResponse>({ success: true, message: "File updated successfully" });
	}
);

// Delete a single file/folder
// TODO: implement delete multiple files/folders
filesRouter.delete(
	"/",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileDeleteRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		const { error, data } = deleteFileSchema.safeParse(c.req.query());
		if (error) {
			return c.json<ApiResponse>({ success: false, message: error.errors[0]?.message }, 400);
		}

		try {
			// Delete all fileTag associations for the file
			// Has to be done manually since we don't store all files locally
			await tagService.deleteFileTagsByFileId(data.fileId, user.id);
		} catch {
			return c.json<ApiResponse>({ success: false, message: "Failed to delete file tag relationships." });
		}

		const fileId = data.fileId;
		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const success = await drive.deleteFile(fileId);

		if (!success) {
			return c.json<ApiResponse>({ success: false, message: "Failed to delete file" }, 500);
		}

		return c.json<ApiResponse>({ success: true, message: "File deleted successfully" });
	}
);

// Create file/folders
filesRouter.post(
	"/",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileUploadRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		//Validation
		const { error, data } = createFileSchema.safeParse(c.req.query());
		if (error) {
			return c.json<ApiResponse>({ success: false, message: error.message }, 400);
		}

		const name = data.name;
		const mimeType = data.mimeType;
		const parent = data.parent ? data.parent : undefined;

		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const success = await drive.createFile(name, mimeType, parent);

		if (!success) {
			return c.json<ApiResponse>({ success: false, message: "Failed to create file" }, 500);
		}

		return c.json<ApiResponse>({ success: true, message: "File created successfully" });
	}
);

// Upload file route with security middleware
filesRouter.post(
	"/upload",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return fileUploadRateLimiter(c.get("user"));
			},
		},
		securityHeaders: true,
	}),
	async (c: Context) => {
		const user: Session["user"] = c.get("user");

		try {
			const formData = await c.req.formData();
			const file = formData.get("file") as UploadedFile | null;
			const parentId = c.req.query("parentId");
			const returnedValues = c.req.queries("returnedValues[]");

			if (!file) {
				return c.json<ApiResponse>({ success: false, message: "No file provided" }, 400);
			}

			// Validate file type
			if (!ALLOWED_MIME_TYPES.includes(file.type)) {
				return c.json<ApiResponse>({ success: false, message: `File type ${file.type} is not allowed` }, 400);
			}

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				return c.json<ApiResponse>(
					{
						success: false,
						message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
					},
					400
				);
			}

			const { data, error } = uploadFileSchema.safeParse({
				file,
				parentId: parentId,
				returnedValues: returnedValues,
			});

			if (error) {
				return c.json<ApiResponse>(
					{
						success: false,
						message: error.errors[0]?.message,
					},
					400
				);
			}

			let drive;
			try {
				drive = await getDriveManagerForUser(user, c.req.raw.headers);
				if (!drive) {
					throw new Error("Failed to initialize storage provider");
				}
			} catch (error) {
				console.error("Error initializing storage provider:", error);
				return c.json<ApiResponse>({ success: false, message: "Failed to initialize storage provider" }, 500);
			}

			// Process file upload with proper cleanup
			try {
				// Convert File to Readable stream for upload
				const arrayBuffer = await file.arrayBuffer();
				const fileBuffer = Buffer.from(arrayBuffer);
				const readableStream = new Readable();
				readableStream.push(fileBuffer);
				readableStream.push(null); // Signal end of stream

				// Upload the file with timeout
				const uploadPromise = drive.uploadFile(
					file.name,
					file.type,
					readableStream,
					data.returnedValues,
					data.parentId
				);

				// Set a timeout for the upload (5 minutes)
				const UPLOAD_TIMEOUT = 5 * 60 * 1000;
				const uploadedFile = await Promise.race([
					uploadPromise,
					new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)),
				]);

				if (!uploadedFile) {
					throw new Error("Upload failed: No file was returned from storage provider");
				}

				// Return the uploaded file info
				return c.json<ApiResponse>({
					success: true,
					message: "File uploaded successfully",
				});
			} catch (error) {
				console.error("Request processing error:", error);

				// Don't leak internal error details to the client
				const errorMessage =
					error instanceof Error
						? error.message.includes("maxFileSize")
							? "File too large"
							: "Invalid request"
						: "An error occurred";

				return c.json<ApiResponse>(
					{
						success: false,
						message: errorMessage,
					},
					errorMessage === "File too large" ? 413 : 400
				);
			}
		} catch (error) {
			console.error("Unexpected error in upload handler:", error);
			return c.json<ApiResponse>({ success: false, message: "An unexpected error occurred" }, 500);
		}
	}
);

export default filesRouter;
