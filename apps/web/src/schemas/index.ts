import { z } from "zod";

// Common password validation schema
const createPasswordSchema = () =>
	z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must be less than 100 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number");

// Common confirm password schema with refinement
const createConfirmPasswordSchema =
	(passwordField = "password") =>
	(schema: z.ZodTypeAny) =>
		schema.refine(data => data[passwordField] === data.confirmPassword, {
			message: "Passwords do not match",
			path: ["confirmPassword"],
		});

export const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: createPasswordSchema(),
	remember: z.boolean(),
});

const baseSignUpSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email address"),
	password: createPasswordSchema(),
	confirmPassword: z.string(),
});

export const signUpSchema = createConfirmPasswordSchema()(baseSignUpSchema);

export const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

const baseResetPasswordSchema = z.object({
	password: createPasswordSchema(),
	confirmPassword: createPasswordSchema(),
});

export const resetPasswordSchema = createConfirmPasswordSchema()(baseResetPasswordSchema);

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Tag validation schemas
const tagNameSchema = z
	.string()
	.min(1, "Tag name is required")
	.max(50, "Tag name must be less than 50 characters")
	.regex(/^[a-zA-Z0-9-_\s]+$/, "Tag name must contain only alphabetic characters, numbers and spaces")
	.trim();

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid 6-digit hex code (e.g., #FF0000)");

export const createTagSchema = z.object({
	name: tagNameSchema,
	color: hexColorSchema,
	parentId: z.string().nullable().optional(),
});

export const updateTagSchema = z.object({
	id: z.string(),
	name: tagNameSchema.optional(),
	color: hexColorSchema.optional(),
	parentId: z.string().nullable().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
