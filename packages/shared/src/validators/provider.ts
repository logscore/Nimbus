import z from "zod";

// Define social providers first
export const driveProviderSchema = z.enum(["google", "microsoft"]);
export type DriveProvider = z.infer<typeof driveProviderSchema>;

// Create provider schema by combining social providers with "credential"
// https://www.better-auth.com/docs/authentication/email-password#configuration
export const providerSchema = z.enum(["credential", ...driveProviderSchema.options]).nullable();
