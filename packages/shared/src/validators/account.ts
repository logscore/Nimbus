import { driveProviderSchema } from "./provider";
import { limitedStringSchema } from "./string";
import z from "zod";

export const nicknameSchema = limitedStringSchema.nullable();

export const limitedAccessAccountSchema = z.object({
	id: z.string(),
	providerId: driveProviderSchema,
	accountId: z.string(),
	scope: z.string(),
	nickname: nicknameSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const updateAccountSchema = z.object({
	id: z.string(),
	nickname: nicknameSchema,
});

export type LimitedAccessAccount = z.infer<typeof limitedAccessAccountSchema>;
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>;
