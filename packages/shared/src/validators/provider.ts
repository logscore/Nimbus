import z from "zod";

// Define social providers first
export const socialProviderSchema = z.enum(["google", "microsoft"]);
export type SocialProvider = z.infer<typeof socialProviderSchema>;

// Create provider schema by combining social providers with "credential"
// https://www.better-auth.com/docs/authentication/email-password#configuration
export const providerSchema = z.enum(["credential", ...socialProviderSchema.options]).nullable();
