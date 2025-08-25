import { MAX_FILE_SIZE } from "../constants";
import z from "zod";

const returnedValuesSchema = z.array(z.string());

export const getFilesSchema = z.object({
	parentId: z.string().min(1).default("root"),
	pageSize: z.coerce.number().int().min(1).max(100).default(30),
	pageToken: z.string().optional(),
	returnedValues: returnedValuesSchema.optional(),
});

export const fileIdSchema = z
	.string()
	.nonempty("File ID cannot be empty")
	.max(250, "File ID cannot be longer than 250 characters");

export const fileIdObjectSchema = z.object({
	fileId: fileIdSchema,
});

export const getFileByIdParamSchema = fileIdObjectSchema;
export const getFileByIdQuerySchema = z.object({
	returnedValues: returnedValuesSchema.optional(),
});

const getFileByIdSchema = z.object({}).extend(getFileByIdParamSchema.shape).extend(getFileByIdQuerySchema.shape);

export const deleteFileSchema = fileIdObjectSchema;

export const updateFileSchema = z.object({
	fileId: fileIdSchema,
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
	// TODO: implement updating more than just name
});

export const createFileSchema = z.object({
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
	mimeType: z.string().min(1, "MIME type cannot be empty").max(100, "MIME type cannot be longer than 100 characters"),
	parent: fileIdSchema.optional(),
});

export const uploadFileQuerySchema = z.object({
	parentId: fileIdSchema,
});

export const uploadFileFormSchema = z.object({
	// File size and mime is validated here and on the backend
	file: z
		.custom<File>(file => file instanceof File, { message: "Invalid file" })
		.refine(file => file.size <= MAX_FILE_SIZE, { message: "File size must be less than 100MB" }),
});

const uploadFileSchema = z.object({}).extend(uploadFileQuerySchema.shape).extend(uploadFileFormSchema.shape);

export const downloadFileSchema = z.object({
	fileId: fileIdSchema,
	exportMimeType: z
		.string()
		.min(1, "Export MIME type cannot be empty")
		.max(100, "Export MIME type too long")
		.optional(),
	acknowledgeAbuse: z.boolean().optional(),
});

export const moveFileSchema = z.object({
	sourceId: fileIdSchema,
	targetParentId: fileIdSchema,
	newName: z.string().max(100, "Name cannot be longer than 100 characters").optional(),
});

export type GetFilesSchema = z.infer<typeof getFilesSchema>;
export type GetFileByIdSchema = z.infer<typeof getFileByIdSchema>;
export type DeleteFileSchema = z.infer<typeof deleteFileSchema>;
export type UpdateFileSchema = z.infer<typeof updateFileSchema>;
export type CreateFileSchema = z.infer<typeof createFileSchema>;
export type UploadFileSchema = z.infer<typeof uploadFileSchema>;
export type DownloadFileSchema = z.infer<typeof downloadFileSchema>;
export type MoveFileSchema = z.infer<typeof moveFileSchema>;
