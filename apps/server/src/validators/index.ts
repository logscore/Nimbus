import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@nimbus/shared";
import { z } from "zod";

const fileIdSchema = z
	.string()
	.min(1, "File ID cannot be empty")
	.max(250, "File ID cannot be longer than 250 characters");

export const sendMailSchema = z.object({
	to: z.string().email(),
	subject: z.string().min(1),
	text: z.string().min(1),
});

export const emailSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.refine(email => {
			const [, domain] = email.split("@");
			if (!domain) return false;

			const labels = domain.split(".");
			if (labels.length < 2) return false;

			// Check each label
			const validLabel = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
			if (!labels.every(label => label.length > 0 && label.length <= 15 && validLabel.test(label))) {
				return false;
			}

			// TLD validation
			const tld = labels.at(-1);
			if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) return false;

			return true;
		}, "Please enter a valid email address and try again"),
});

export const getFilesSchema = z.object({
	parentId: z.string().min(1).default("root"),
	pageSize: z.coerce.number().int().min(1).max(100).default(30),
	returnedValues: z.string().array(),
	pageToken: z.string().optional(),
});

export const getFileByIdSchema = z.object({
	fileId: fileIdSchema,
	returnedValues: z.string().array(),
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

// Tag schemas
const tagIdSchema = z.string().min(1, "Tag ID cannot be empty").max(250, "Tag ID cannot be longer than 250 characters");

export const createTagSchema = z.object({
	name: z
		.string()
		.min(1, "Tag name cannot be empty")
		.max(50, "Tag name cannot be longer than 50 characters")
		.regex(/^[a-zA-Z0-9-_\s]+$/, "Tag name must contain only alphabetic characters, numbers and spaces")
		.trim(),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.default("#808080"),
	parentId: z.string().nullable().optional(),
});

export const updateTagSchema = z.object({
	name: z
		.string()
		.min(1, "Tag name cannot be empty")
		.max(50, "Tag name cannot be longer than 50 characters")
		.regex(/^[a-zA-Z0-9-_\s]+$/, "Tag name must contain only alphabetic characters, numbers and spaces")
		.trim()
		.optional(),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.optional(),
	parentId: z.string().nullable().optional(),
});

export const deleteTagSchema = z.object({
	id: tagIdSchema,
});

export const getTagByIdSchema = z.object({
	id: tagIdSchema,
});

export const addTagsToFileSchema = z.object({
	fileId: fileIdSchema,
	tagIds: z.array(tagIdSchema).min(1, "At least one tag ID must be provided"),
});

export const removeTagsFromFileSchema = z.object({
	fileId: fileIdSchema,
	tagIds: z.array(tagIdSchema).min(1, "At least one tag ID must be provided"),
});
