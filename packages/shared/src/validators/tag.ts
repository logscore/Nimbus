import { fileIdSchema } from "./file";
import z from "zod";

export const tagNameSchema = z
	.string()
	.min(1, "Tag name is required")
	.max(50, "Tag name must be less than 50 characters")
	.regex(/^[a-zA-Z0-9-_\s]+$/, "Tag name must contain only alphabetic characters, numbers, and spaces")
	.trim();

export const hexColorSchema = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid 6-digit hex code (e.g., #FF0000)");

export const tagIdSchema = z
	.string()
	.min(1, "Tag ID cannot be empty")
	.max(250, "Tag ID cannot be longer than 250 characters");

export const createTagSchema = z.object({
	name: tagNameSchema,
	color: hexColorSchema.default("#808080"),
	parentId: z.string().nullable().optional(),
});

export const updateTagSchema = z.object({
	id: tagIdSchema,
	name: tagNameSchema.optional(),
	color: hexColorSchema.optional(),
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

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
