import { waitlistRateLimiter } from "@nimbus/cache/rate-limiters";
import { sendError, sendSuccess } from "@/routes/utils";
import { securityMiddleware } from "@/middleware";
import { zValidator } from "@hono/zod-validator";
import { waitlist } from "@nimbus/db/schema";
import { emailSchema } from "@nimbus/shared";
import { createPublicRouter } from "@/hono";
import { count, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const waitlistRouter = createPublicRouter();

waitlistRouter.post(
	"/join",
	securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return waitlistRateLimiter(
					c.req.header("cf-connecting-ip") || c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || "unknown"
				);
			},
		},
	}),
	zValidator("json", emailSchema, (result, c) => {
		if (!result.success) {
			return sendError(c, { message: result.error.message, status: 400 });
		}
	}),
	async c => {
		try {
			const email = (await c.req.json()).email;

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

waitlistRouter.get("/count", async c => {
	try {
		const result = await c.var.db.select({ count: count() }).from(waitlist);
		const waitlistCount = result[0]?.count || 0;
		const data = { count: waitlistCount };
		return sendSuccess(c, { data });
	} catch (error) {
		console.error("Error getting waitlist count:", error);
		return sendError(c);
	}
});

export default waitlistRouter;
