import z from "zod";

export const updateUserSchema = z.object({
	defaultAccountId: z.string(),
	defaultProviderId: z.string(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
