import { z } from "zod";

const ALLOWED_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "proton.me"];

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

			const allowed = ALLOWED_DOMAINS.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
			if (!allowed) return false;

			const labels = domain.split(".");
			if (labels.length < 2 || labels.length > 3) return false;

			const tld = labels.at(-1);
			if (!tld) return false;

			return /^[a-z]{2,63}$/i.test(tld);
		}, "Invalid email, please try again"),
});

export const getFileByIdSchema = z.object({
	id: fileIdSchema,
});

export const deleteFileSchema = z.object({
	id: fileIdSchema,
});

export const updateFileSchema = z.object({
	id: fileIdSchema,
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
});

export const createFileSchema = z.object({
	name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot be longer than 100 characters"),
	mimeType: z.string().min(1, "MIME type cannot be empty").max(100, "MIME type cannot be longer than 100 characters"),
	parents: fileIdSchema.optional(),
});

// Tag schemas
export const tagIdSchema = z
	.string()
	.min(1, "Tag ID cannot be empty")
	.max(250, "Tag ID cannot be longer than 250 characters");

export const createTagSchema = z.object({
	name: z.string().min(1, "Tag name cannot be empty").max(50, "Tag name cannot be longer than 50 characters"),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.default("#808080"),
	parentId: z.string().optional(),
});

export const updateTagSchema = z.object({
	id: tagIdSchema,
	name: z
		.string()
		.min(1, "Tag name cannot be empty")
		.max(50, "Tag name cannot be longer than 50 characters")
		.optional(),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.optional(),
	parentId: z.string().optional(),
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
