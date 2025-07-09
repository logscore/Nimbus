import { waitlistRateLimiter } from "@nimbus/cache/rate-limiters";
import { securityMiddleware } from "@/middleware";
import { zValidator } from "@hono/zod-validator";
import { waitlist } from "@nimbus/db/schema";
import { emailSchema } from "@/validators";
import { count, eq } from "drizzle-orm";
import { createDb } from "@nimbus/db";
import type { Context } from "hono";
import { nanoid } from "nanoid";
import env from "@nimbus/env";
import { Hono } from "hono";

const waitlistRouter = new Hono();

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

			const existing = await createDb(env.DATABASE_URL)
				.select()
				.from(waitlist)
				.where(eq(waitlist.email, email.toLowerCase().trim()))
				.limit(1)
				.then(rows => rows[0]);

			if (existing) {
				return c.json({ success: false, error: "This email is already on the waitlist" }, 400);
			}

			await createDb(env.DATABASE_URL).insert(waitlist).values({
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
		const result = await createDb(env.DATABASE_URL).select({ count: count() }).from(waitlist);
		return c.json({ count: result[0]?.count || 0 });
	} catch (error) {
		console.error("Error getting waitlist count:", error);
		return c.json({ success: false, error: "Internal server error" }, 500);
	}
});

export default waitlistRouter;
