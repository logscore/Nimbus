import z from "zod";

// const providers = ["google", "microsoft", "dropbox", "box", "nimbus", "apple", "github"] as const;
// const providerSlugs = ["g", "m", "d", "b", "n", "a", "gh"] as const;
const providers = ["google", "microsoft"] as const;
const providerSlugs = ["g", "m"] as const;

// Define social providers first
export const driveProviderSchema = z.enum(providers);
export const driveProviderSlugSchema = z.enum(providerSlugs);
export type DriveProvider = z.infer<typeof driveProviderSchema>;
export type DriveProviderSlug = z.infer<typeof driveProviderSlugSchema>;

// Create provider schema by combining social providers with "credential"
// https://www.better-auth.com/docs/authentication/email-password#configuration
export const providerSchema = z.enum(["credential", ...driveProviderSchema.options]).nullable();
