import { driveProviderSchema } from "@nimbus/shared";
import z from "zod";

export const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	defaultAccountId: z.string().nullable(),
	defaultProviderId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const updateUserSchema = z.object({
	defaultAccountId: z.string(),
	defaultProviderId: driveProviderSchema,
});

export type UserSchema = z.infer<typeof userSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
