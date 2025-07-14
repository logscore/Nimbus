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
import { handleUploadError, sendError, sendSuccess } from "@/routes/utils";
import { createProtectedRouter, getSessionUserFromContext } from "@/hono";
import { buildSecurityMiddleware } from "@/middleware";
import { FileService } from "./file-service";
import type { UploadedFile } from "../types";
import { Readable } from "node:stream";

const filesRouter = createProtectedRouter();
const fileService = new FileService();

export type FilesRouter = typeof filesRouter;

// Get files
// TODO: Grab fileId from url path, not the params
filesRouter.get("/", buildSecurityMiddleware(fileGetRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

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
		return sendError(c, { message: "Files not found", status: 404 });
	}

	return sendSuccess(c, { data: files });
});

// Get file by ID
filesRouter.get("/:id", buildSecurityMiddleware(fileGetRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

	const { error, data } = getFileByIdSchema.safeParse(c.req.param());
	if (error) {
		return sendError(c, error);
	}

	const file = await fileService.getById(user, c.req.raw.headers, data.fileId, data.returnedValues);
	if (!file) {
		return sendError(c, { message: "File not found", status: 404 });
	}

	return sendSuccess(c, { data: file });
});

// Update file
// TODO: Note that the validation only works for renaming, this will need to be updated as we support more update features
filesRouter.put("/", buildSecurityMiddleware(fileUpdateRateLimiter), async c => {
	const user = getSessionUserFromContext(c);
	const fileId = c.req.query("fileId");
	const reqName = (await c.req.json()).name;

	const { error, data } = updateFileSchema.safeParse({ fileId, name: reqName });
	if (error) {
		return sendError(c, error);
	}

	const success = await fileService.updateFile(user, c.req.raw.headers, data.fileId, { name: data.name });
	if (!success) {
		return sendError(c, { message: "Failed to update file", status: 500 });
	}

	return sendSuccess(c, { message: "File updated successfully" });
});

// Delete file
// TODO: implement delete multiple files/folders
filesRouter.delete("/", buildSecurityMiddleware(fileDeleteRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

	const { error, data } = deleteFileSchema.safeParse(c.req.query());
	if (error) {
		return sendError(c, error);
	}

	const success = await fileService.deleteFile(user, c.req.raw.headers, data.fileId);
	if (!success) {
		return sendError(c, { message: "Failed to delete file", status: 500 });
	}

	return sendSuccess(c, { message: "File deleted successfully" });
});

// Create file/folder
filesRouter.post("/", buildSecurityMiddleware(fileUploadRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

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
		return sendError(c, { message: "Failed to create file", status: 500 });
	}

	return sendSuccess(c, { message: "File created successfully", status: 201 });
});

// Upload file
filesRouter.post("/upload", buildSecurityMiddleware(fileUploadRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

	try {
		const formData = await c.req.formData();
		// TODO(typing): figure out how to do this better
		const file = formData.get("file") as UploadedFile | null;
		const parentId = c.req.query("parentId");

		if (!file) {
			return sendError(c, { message: "No file provided", status: 400 });
		}

		// Validate file type
		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return sendError(c, { message: `File type ${file.type} is not allowed`, status: 400 });
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return sendError(c, {
				message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
				status: 400,
			});
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
			return sendError(c, { message: "Upload failed: No file was returned from storage provider", status: 500 });
		}

		return sendSuccess(c, { message: "File uploaded successfully", status: 201 });
	} catch (error) {
		const options = handleUploadError(error);
		return sendError(c, options);
	}
});

// Download file
filesRouter.get("/download/:fileId", buildSecurityMiddleware(fileGetRateLimiter), async c => {
	const user = getSessionUserFromContext(c);

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
			return sendError(c, { message: "File not found or could not be downloaded", status: 404 });
		}

		// Set appropriate headers for file download
		c.header("Content-Type", downloadResult.mimeType);
		c.header("Content-Disposition", `attachment; filename="${downloadResult.filename}"`);
		c.header("Content-Length", downloadResult.size.toString());

		// Return the file data
		return c.body(downloadResult.data);
	} catch (error) {
		const options = handleUploadError(error);
		return sendError(c, options);
	}
});

export default filesRouter;
