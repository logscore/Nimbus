import z from "zod";

export const limitedStringSchema = z
	.string()
	.min(1, "Required")
	.max(50, "Must be less than 50 characters")
	.regex(
		/^[a-zA-Z0-9-_@.\s]+$/,
		"Only alphabetic characters, numbers, hyphens, underscores, @, periods, and spaces are allowed"
	)
	.trim();
