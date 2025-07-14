import { zValidator } from "@hono/zod-validator";
import { sendMailSchema } from "@nimbus/shared";
import { createPublicRouter } from "@/hono";
import env from "@nimbus/env/server";
import { sendError } from "../utils";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

const emailRouter = createPublicRouter();

// TODO:(security): evaluate if we can do a more secure flow
emailRouter.post("/send-mail", zValidator("json", sendMailSchema), async c => {
	try {
		const { to, subject, text } = await c.req.json();

		const from = env.EMAIL_FROM;

		if (!from) {
			console.error("Missing environment variables");
			return sendError(c);
		}

		const { data, error } = await resend.emails.send({
			from,
			to,
			subject,
			text,
		});

		if (error) {
			console.error("Error sending email:", error);
			return sendError(c);
		}

		return c.json({
			success: true,
			messageId: data?.id,
		});
	} catch (err) {
		console.error("Unexpected error sending email:", err);
		return sendError(c);
	}
});

export default emailRouter;
