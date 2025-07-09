import {
	ALLOWED_MIME_TYPES,
	createFileSchema,
	deleteFileSchema,
	downloadFileSchema,
	getFileByIdSchema,
	getFilesSchema,
	MAX_FILE_SIZE,
	updateFileSchema,
	uploadFileSchema,
} from "@nimbus/shared";
import {
	fileDeleteRateLimiter,
	fileGetRateLimiter,
	fileUpdateRateLimiter,
	fileUploadRateLimiter,
} from "@nimbus/cache/rate-limiters";
import { handleUploadError, sendError, sendSuccess } from "./utils";
import { buildSecurityMiddleware } from "@/middleware";
import type { SessionUser } from "@nimbus/auth/auth";
import type { UploadedFile } from "@/routes/types";
import { FileService } from "./file-service";
import { Readable } from "node:stream";
import type { Context } from "hono";
import { Hono } from "hono";

const filesRouter = new Hono();
const fileService = new FileService();

export type FilesRouter = typeof filesRouter;

filesRouter.get("/", buildSecurityMiddleware(fileGetRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	const { data, error } = getFilesSchema.safeParse({
		parentId: c.req.query("parentId"),
		pageSize: c.req.query("pageSize"),
		returnedValues: c.req.queries("returnedValues[]"),
		pageToken: c.req.query("pageToken") ?? undefined,
	});

	if (error) {
		return sendError(c, error);
	}

	const files = await fileService.listFiles(user, c.req.raw.headers, data);
	if (!files) {
		return sendError(c, "Files not found", 404);
	}

	return sendSuccess(c, files);
});

// Get file by ID
filesRouter.get("/:id", buildSecurityMiddleware(fileGetRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	const { error, data } = getFileByIdSchema.safeParse(c.req.param());
	if (error) {
		return sendError(c, error);
	}

	const file = await fileService.getById(user, c.req.raw.headers, data.fileId, data.returnedValues);
	if (!file) {
		return sendError(c, "File not found", 404);
	}

	return sendSuccess(c, file);
});

// Update file
filesRouter.put("/", buildSecurityMiddleware(fileUpdateRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");
	const fileId = c.req.query("fileId");
	const reqName = (await c.req.json()).name;

	const { error, data } = updateFileSchema.safeParse({ fileId, name: reqName });
	if (error) {
		return sendError(c, error);
	}

	const success = await fileService.updateFile(user, c.req.raw.headers, data.fileId, { name: data.name });
	if (!success) {
		return sendError(c, "Failed to update file", 500);
	}

	return sendSuccess(c, undefined, "File updated successfully");
});

// Delete file
filesRouter.delete("/", buildSecurityMiddleware(fileDeleteRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	const { error, data } = deleteFileSchema.safeParse(c.req.query());
	if (error) {
		return sendError(c, error);
	}

	const success = await fileService.deleteFile(user, c.req.raw.headers, data.fileId);
	if (!success) {
		return sendError(c, "Failed to delete file", 500);
	}

	return sendSuccess(c, undefined, "File deleted successfully");
});

// Create file/folder
filesRouter.post("/", buildSecurityMiddleware(fileUploadRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	const { error, data } = createFileSchema.safeParse(c.req.query());
	if (error) {
		return sendError(c, error);
	}

	const success = await fileService.createFile(user, c.req.raw.headers, {
		name: data.name,
		mimeType: data.mimeType,
		parentId: data.parent,
	});

	if (!success) {
		return sendError(c, "Failed to create file", 500);
	}

	return sendSuccess(c, undefined, "File created successfully");
});

// Upload file
filesRouter.post("/upload", buildSecurityMiddleware(fileUploadRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	try {
		const formData = await c.req.formData();
		const file = formData.get("file") as UploadedFile | null;
		const parentId = c.req.query("parentId");

		if (!file) {
			return sendError(c, "No file provided");
		}

		// Validate file type
		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return sendError(c, `File type ${file.type} is not allowed`);
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return sendError(c, `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
		}

		const { data, error } = uploadFileSchema.safeParse({ file, parentId });
		if (error) {
			return sendError(c, error);
		}

		// Convert File to Readable stream for upload
		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = Buffer.from(arrayBuffer);
		const readableStream = new Readable();
		readableStream.push(fileBuffer);
		readableStream.push(null); // Signal end of stream

		// Upload with timeout
		const UPLOAD_TIMEOUT = 5 * 60 * 1000;
		const uploadPromise = fileService.createFile(
			user,
			c.req.raw.headers,
			{
				name: file.name,
				mimeType: file.type,
				parentId: data.parentId,
			},
			readableStream
		);

		const uploadedFile = await Promise.race([
			uploadPromise,
			new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)),
		]);

		if (!uploadedFile) {
			return sendError(c, "Upload failed: No file was returned from storage provider", 500);
		}

		return sendSuccess(c, undefined, "File uploaded successfully");
	} catch (error) {
		const { message, status } = handleUploadError(error);
		return sendError(c, message, status);
	}
});

// Download file route
filesRouter.get("/download/:fileId", buildSecurityMiddleware(fileGetRateLimiter), async (c: Context) => {
	const user: SessionUser = c.get("user");

	// Validation
	const { error, data } = downloadFileSchema.safeParse({
		fileId: c.req.param("fileId"),
		exportMimeType: c.req.query("exportMimeType"),
		acknowledgeAbuse: c.req.query("acknowledgeAbuse") === "true" || c.req.query("acknowledgeAbuse") === "1",
	});

	if (error) {
		return sendError(c, error);
	}

	const fileId = data.fileId;

	try {
		const downloadResult = await fileService.downloadFile(user, c.req.raw.headers, fileId, {
			exportMimeType: data.exportMimeType,
			acknowledgeAbuse: data.acknowledgeAbuse,
		});

		if (!downloadResult) {
			return sendError(c, "File not found or could not be downloaded", 404);
		}

		// Set appropriate headers for file download
		c.header("Content-Type", downloadResult.mimeType);
		c.header("Content-Disposition", `attachment; filename="${downloadResult.filename}"`);
		c.header("Content-Length", downloadResult.size.toString());

		// Return the file data
		return c.body(downloadResult.data);
	} catch (error) {
		return sendError(c, error instanceof Error ? error.message : "Failed to download file", 500);
	}
});

export default filesRouter;
