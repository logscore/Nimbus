import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@nimbus/shared";
import z from "zod";

export const fileIdSchema = z
	.string()
	.nonempty("File ID cannot be empty")
	.max(250, "File ID cannot be longer than 250 characters");

export const getFilesSchema = z.object({
	parentId: z.string().min(1).default("root"),
	pageSize: z.coerce.number().int().min(1).max(100).default(30),
	pageToken: z.string().optional(),
});

export const getFileByIdSchema = z.object({
	fileId: fileIdSchema,
});

export const deleteFileSchema = z.object({
	fileId: fileIdSchema,
});

export const updateFileSchema = z.object({
	fileId: fileIdSchema,
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
});

export const createFileSchema = z.object({
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
	mimeType: z.string().min(1, "MIME type cannot be empty").max(100, "MIME type cannot be longer than 100 characters"),
	parent: fileIdSchema.optional(),
});

export const uploadFileSchema = z.object({
	parentId: fileIdSchema,
	// File size and mime is validated here and on the backend
	file: z
		.custom<File>(file => file instanceof File, { message: "Invalid file" })
		.refine(file => file.size <= MAX_FILE_SIZE, { message: "File size must be less than 100MB" })
		.refine(file => ALLOWED_MIME_TYPES.includes(file.type), { message: "Invalid file type" }),
});

export const downloadFileSchema = z.object({
	fileId: fileIdSchema,
	exportMimeType: z
		.string()
		.min(1, "Export MIME type cannot be empty")
		.max(100, "Export MIME type too long")
		.optional(),
	acknowledgeAbuse: z.boolean().optional(),
});
