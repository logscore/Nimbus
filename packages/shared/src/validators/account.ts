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

export const createS3AccountSchema = z.object({
	accessKeyId: z.string().min(1, "Access Key ID is required"),
	secretAccessKey: z.string().min(1, "Secret Access Key is required"),
	region: z.string().min(1, "Region is required"),
	bucketName: z.string().min(1, "Bucket name is required"),
	endpoint: z.string().url().optional(),
	nickname: nicknameSchema,
});

export type LimitedAccessAccount = z.infer<typeof limitedAccessAccountSchema>;
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>;
export type CreateS3AccountSchema = z.infer<typeof createS3AccountSchema>;
