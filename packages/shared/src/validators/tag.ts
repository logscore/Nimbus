import { fileIdObjectSchema } from "./file";
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

export const tagIdObjectSchema = z.object({
	id: tagIdSchema,
});
export const getTagByIdSchema = tagIdObjectSchema;
export const deleteTagSchema = tagIdObjectSchema;

export const updateTagParamSchema = tagIdObjectSchema;
export const updateTagJsonSchema = z.object({
	name: tagNameSchema.optional(),
	color: hexColorSchema.optional(),
	parentId: z.string().nullable().optional(),
});
export const updateTagSchema = z.object({}).extend(updateTagParamSchema.shape).extend(updateTagJsonSchema.shape);

export const addTagsToFileParamSchema = z.object({}).extend(fileIdObjectSchema.shape);
export const removeTagsFromFileParamSchema = z.object({}).extend(fileIdObjectSchema.shape);
const tagIdsSchema = z.object({
	tagIds: z.array(tagIdSchema).min(1, "At least one tag ID must be provided"),
});
export const addTagsToFileJsonSchema = tagIdsSchema;
export const removeTagsFromFileJsonSchema = tagIdsSchema;

export const addTagsToFileSchema = z
	.object({})
	.extend(addTagsToFileParamSchema.shape)
	.extend(addTagsToFileJsonSchema.shape);
export const removeTagsFromFileSchema = z
	.object({})
	.extend(removeTagsFromFileParamSchema.shape)
	.extend(removeTagsFromFileJsonSchema.shape);

export type GetTagByIdSchema = z.infer<typeof getTagByIdSchema>;
export type DeleteTagSchema = z.infer<typeof deleteTagSchema>;
export type CreateTagSchema = z.infer<typeof createTagSchema>;
export type UpdateTagSchema = z.infer<typeof updateTagSchema>;
export type AddTagsToFileSchema = z.infer<typeof addTagsToFileSchema>;
export type RemoveTagsFromFileSchema = z.infer<typeof removeTagsFromFileSchema>;
