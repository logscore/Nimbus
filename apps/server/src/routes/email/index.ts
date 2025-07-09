import { zValidator } from "@hono/zod-validator";
import { sendMailSchema } from "@/validators";
import type { Context } from "hono";
import { Resend } from "resend";
import env from "@nimbus/env";
import { Hono } from "hono";

const resend = new Resend(env.RESEND_API_KEY);

const emailRouter = new Hono();

emailRouter.post("/send-mail", zValidator("json", sendMailSchema), async (c: Context) => {
	try {
		const { to, subject, text } = await c.req.json();

		const { data, error } = await resend.emails.send({
			from: env.EMAIL_FROM,
			to,
			subject,
			text,
		});

		if (error) {
			console.error("Error sending email:", error);
			return c.json(
				{
					success: false,
					message: "Failed to send email.",
					error,
				},
				500
			);
		}

		return c.json({
			success: true,
			messageId: data?.id,
		});
	} catch (err) {
		console.error("Unexpected error sending email:", err);
		return c.json(
			{
				success: false,
				message: "Unexpected error occurred.",
			},
			500
		);
	}
});

export default emailRouter;
