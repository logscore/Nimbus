import z from "zod";

export const fileIdSchema = z
	.string()
	.nonempty("File ID cannot be empty")
	.max(250, "File ID cannot be longer than 250 characters");

export const fileIdObjectSchema = z.object({
	fileId: fileIdSchema,
});
