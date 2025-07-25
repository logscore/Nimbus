import z from "zod";

export const createPinnedFileSchema = z.object({
	fileId: z.string(),
	name: z.string(),
	type: z.string(),
	mimeType: z.string().optional(),
	provider: z.string(),
	accountId: z.string(),
});

export const deletePinnedFileSchema = z.object({
	id: z.string(),
});

export type CreatePinnedFile = z.infer<typeof createPinnedFileSchema>;
export type DeletePinnedFile = z.infer<typeof deletePinnedFileSchema>;
export type { PinnedFileTableSelect as PinnedFile } from "@nimbus/db/schema";
