import {
	createFileSchema,
	deleteFileSchema,
	downloadFileSchema,
	getFileByIdParamSchema,
	getFileByIdQuerySchema,
	getFilesSchema,
	MAX_FILE_SIZE,
	updateFileSchema,
	uploadFileFormSchema,
	uploadFileQuerySchema,
} from "@nimbus/shared";
import { handleUploadError, sendError, sendSuccess } from "../utils";
import { createDriveProviderRouter } from "../../hono";
import { zValidator } from "@hono/zod-validator";
import { FileService } from "./file-service";

const fileService = new FileService();
const filesRouter = createDriveProviderRouter()
	// Get files
	// TODO: Grab fileId from url path, not the params
	.get("/", zValidator("query", getFilesSchema), async c => {
		const queryData = c.req.valid("query");
		const files = await fileService.listFiles(queryData);
		if (!files) {
			return sendError(c, { message: "Files not found", status: 404 });
		}
		return sendSuccess(c, { data: files });
	})

	// Get file by ID
	.get(
		"/:fileId",
		zValidator("param", getFileByIdParamSchema),
		zValidator("query", getFileByIdQuerySchema),
		async c => {
			const fileId = c.req.valid("param").fileId;
			const returnedValues = c.req.valid("query").returnedValues;
			const file = await fileService.getById({ fileId, returnedValues });
			if (!file) {
				return sendError(c, { message: "File not found", status: 404 });
			}
			return sendSuccess(c, { data: file });
		}
	)

	// Update file
	// TODO: Note that the validation only works for renaming, this will need to be updated as we support more update features
	.put("/", zValidator("query", updateFileSchema), async c => {
		const queryData = c.req.valid("query");
		const success = await fileService.updateFile(queryData);
		if (!success) {
			return sendError(c, { message: "Failed to update file", status: 500 });
		}
		return sendSuccess(c, { message: "File updated successfully" });
	})

	// Delete file
	// TODO: implement delete multiple files/folders
	.delete("/", zValidator("query", deleteFileSchema), async c => {
		const queryData = c.req.valid("query");
		const success = await fileService.deleteFile(queryData);
		if (!success) {
			return sendError(c, { message: "Failed to delete file", status: 500 });
		}
		return sendSuccess(c, { message: "File deleted successfully" });
	})

	// Create file/folder
	.post("/", zValidator("query", createFileSchema), async c => {
		const queryData = c.req.valid("query");
		const success = await fileService.createFile(queryData);
		if (!success) {
			return sendError(c, { message: "Failed to create file", status: 500 });
		}
		return sendSuccess(c, { message: "File created successfully", status: 201 });
	})

	// Upload file
	.post("/upload", zValidator("form", uploadFileFormSchema), zValidator("query", uploadFileQuerySchema), async c => {
		try {
			const file = c.req.valid("form").file;
			const parentId = c.req.valid("query").parentId;

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				return sendError(c, {
					message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
					status: 400,
				});
			}

			const arrayBuffer = await file.arrayBuffer();
			const fileBuffer = Buffer.from(arrayBuffer);

			// Upload with timeout
			const UPLOAD_TIMEOUT = 5 * 60 * 1000;
			const uploadPromise = fileService.createFile(
				{
					name: file.name,
					mimeType: file.type || "application/octet-stream",
					parentId,
				},
				fileBuffer
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
	})

	// Download file
	.get("/download", zValidator("query", downloadFileSchema), async c => {
		const fileId = c.req.valid("query").fileId;
		const exportMimeType = c.req.valid("query").exportMimeType;
		const acknowledgeAbuse = c.req.valid("query").acknowledgeAbuse;

		try {
			const downloadResult = await fileService.downloadFile({
				fileId,
				exportMimeType,
				acknowledgeAbuse,
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
