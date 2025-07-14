import { createRateLimiterMiddleware } from "@/utils/rate-limiter-utils";
import { waitlistRateLimiter } from "@nimbus/cache/rate-limiters";
import { zValidator } from "@hono/zod-validator";
import { waitlist } from "@nimbus/db/schema";
import { emailSchema } from "@/validators";
import { count, eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "@nimbus/db";
import { nanoid } from "nanoid";
import { Hono } from "hono";

const waitlistRouter = new Hono();

const waitlistRateLimiterMiddleware = createRateLimiterMiddleware({ limiter: waitlistRateLimiter });

waitlistRouter.post(
	"/join",
	waitlistRateLimiterMiddleware,
	zValidator("json", emailSchema, (result, c) => {
		if (!result.success) {
			// const firstError = result.error.errors[0];
			return c.json(
				{
					success: false,
					error: result.error.errors[0]?.message,
				},
				400
			);
		}
	}),
	async (c: Context) => {
		try {
			const email = (await c.req.json()).email;

			const existing = await db
				.select()
				.from(waitlist)
				.where(eq(waitlist.email, email.toLowerCase().trim()))
				.limit(1)
				.then(rows => rows[0]);

			if (existing) {
				return c.json({ success: false, error: "This email is already on the waitlist" }, 400);
			}

			await db.insert(waitlist).values({
				id: nanoid(),
				email: email.toLowerCase().trim(),
			});

			return c.json({ success: true }, 201);
		} catch (error) {
			console.error("Error adding email to waitlist:", error);
			return c.json({ success: false, error: "Internal server error" }, 500);
		}
	}
);

waitlistRouter.get("/count", async c => {
	try {
		const result = await db.select({ count: count() }).from(waitlist);
		return c.json({ count: result[0]?.count || 0 });
	} catch (error) {
		console.error("Error getting waitlist count:", error);
		return c.json({ success: false, error: "Internal server error" }, 500);
	}
});

export default waitlistRouter;
