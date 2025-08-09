import { createPublicRouter, type PublicRouterContext } from "../../hono";
import { emailObjectSchema, type WaitlistCount } from "@nimbus/shared";
import { buildSecurityMiddleware } from "../../middleware/security";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { waitlist } from "@nimbus/db/schema";
import { count } from "drizzle-orm";
import { nanoid } from "nanoid";

const rateLimiter = (c: PublicRouterContext) =>
	buildSecurityMiddleware(c, {
		points: 3,
		duration: 120, // 2 minutes
		blockDuration: 60, // 1 minute
		keyPrefix: "rl:waitlist",
	});

const waitlistRouter = createPublicRouter()
	.use("*", (c, next) => rateLimiter(c)(c, next))
	.get("/count", async c => {
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
		zValidator("json", emailObjectSchema, (result, c) => {
			if (!result.success) {
				return sendError(c, { message: result.error.message, status: 400 });
			}
		}),
		async c => {
			try {
				const email = c.req.valid("json").email;

				const existing = await c.var.db.query.waitlist.findFirst({
					where: (table, { eq }) => eq(table.email, email.toLowerCase().trim()),
				});

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
