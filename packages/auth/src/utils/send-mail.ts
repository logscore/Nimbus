import env from "@nimbus/env/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
	try {
		const from = env.EMAIL_FROM;

		if (!from) {
			console.error("Missing environment variables");
		}

		const { data, error } = await resend.emails.send({
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
