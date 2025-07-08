import { emailSchema, hexColorSchema, passwordSchema, tagIdSchema, tagNameSchema } from "@nimbus/shared";
import { z } from "zod";

// Common confirm password schema with refinement
const createConfirmPasswordSchema =
	(passwordField = "password") =>
	(schema: z.ZodTypeAny) =>
		schema.refine(data => data[passwordField] === data.confirmPassword, {
			message: "Passwords do not match",
			path: ["confirmPassword"],
		});

export const signInSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	remember: z.boolean(),
});

const baseSignUpSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: emailSchema,
	password: passwordSchema,
	confirmPassword: z.string(),
});

export const signUpSchema = createConfirmPasswordSchema()(baseSignUpSchema);

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

const baseResetPasswordSchema = z.object({
	password: passwordSchema,
	confirmPassword: passwordSchema,
});

export const resetPasswordSchema = createConfirmPasswordSchema()(baseResetPasswordSchema);

export const createTagSchema = z.object({
	name: tagNameSchema,
	color: hexColorSchema,
	parentId: z.string().nullable().optional(),
});

export const updateTagSchema = z.object({
	id: tagIdSchema,
	name: tagNameSchema.optional(),
	color: hexColorSchema.optional(),
	parentId: z.string().nullable().optional(),
});

// Export types
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
