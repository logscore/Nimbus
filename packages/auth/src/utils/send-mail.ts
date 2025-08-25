import type { Resend } from "resend";

interface EmailContext {
	resend: Resend;
	from: string | undefined;
}

interface SendMailOptions {
	to: string;
	subject: string;
	text: string;
}

export async function sendMail(ctx: EmailContext, { to, subject, text }: SendMailOptions) {
	try {
		const from = ctx.from;

		if (!from) {
			console.error("Missing environment variables");
		}

		const { data, error } = await ctx.resend.emails.send({
			from,
			to,
			subject,
			text,
		});

		if (error) {
			console.error("Error sending email:", error);
			return;
		}

		return {
			success: true,
			messageId: data?.id,
		};
	} catch (err) {
		console.error("Unexpected error sending email:", err);
	}
}
