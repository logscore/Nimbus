import { z } from "zod";

// Common email schemas
export const emailSchema = z
	.string()
	.email("Please enter a valid email address")
	.refine(email => {
		const [, domain] = email.split("@");
		if (!domain) return false;

		const labels = domain.split(".");
		if (labels.length < 2) return false;

		// Check each label
		const validLabel = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
		if (!labels.every(label => label.length > 0 && label.length <= 15 && validLabel.test(label))) {
			return false;
		}

		// TLD validation
		const tld = labels.at(-1);
		if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) return false;

		return true;
	}, "Please enter a valid email address and try again");

export const sendMailSchema = z.object({
	to: emailSchema,
	subject: z.string().min(1, "Subject is required"),
	text: z.string().min(1, "Message text is required"),
});

// Common password validation schema
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(100, "Password must be less than 100 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");

// Tag validation schemas
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

export const fileIdSchema = z
	.string()
	.min(1, "File ID cannot be empty")
	.max(250, "File ID cannot be longer than 250 characters");

// Export types for convenience
export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type TagNameInput = z.infer<typeof tagNameSchema>;
export type HexColorInput = z.infer<typeof hexColorSchema>;
export type TagIdInput = z.infer<typeof tagIdSchema>;
export type FileIdInput = z.infer<typeof fileIdSchema>;
