import { emailObjectSchema, type WaitlistCount } from "@nimbus/shared";
import { buildWaitlistSecurityMiddleware } from "../../middleware";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { createPublicRouter } from "../../hono";
import { waitlist } from "@nimbus/db/schema";
import { count, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const waitlistRouter = createPublicRouter()
	.get("/count", buildWaitlistSecurityMiddleware(), async c => {
		try {
			const result = await c.var.db.select({ count: count() }).from(waitlist);
			const waitlistCount = result[0]?.count || 0;
			const data: WaitlistCount = { count: waitlistCount };
			return sendSuccess(c, { data });
		} catch (error) {
			console.error("Error getting waitlist count:", error);
			return sendError(c);
		}
	})
	.post(
		"/join",
		buildWaitlistSecurityMiddleware(),
		zValidator("json", emailObjectSchema, (result, c) => {
			if (!result.success) {
				return sendError(c, { message: result.error.message, status: 400 });
			}
		}),
		async c => {
			try {
				const email = c.req.valid("json").email;

				const existing = await c.var.db
					.select()
					.from(waitlist)
					.where(eq(waitlist.email, email.toLowerCase().trim()))
					.limit(1)
					.then(rows => rows[0]);

				if (existing) {
					return sendError(c, { message: "This email is already on the waitlist", status: 400 });
				}

				await c.var.db.insert(waitlist).values({
					id: nanoid(),
					email: email.toLowerCase().trim(),
				});
				return sendSuccess(c, { message: "Email added to waitlist", status: 201 });
			} catch (error) {
				console.error("Error adding email to waitlist:", error);
				return sendError(c);
			}
		}
	);

export default waitlistRouter;
