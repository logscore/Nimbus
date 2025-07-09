import z from "zod";

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

export const checkEmailSchema = z.object({
	email: emailSchema,
});
