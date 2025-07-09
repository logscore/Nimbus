import { checkEmailSchema } from "@nimbus/shared";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@nimbus/auth/auth";
import type { Context } from "hono";
import { db } from "@nimbus/db";
import { Hono } from "hono";

const authRouter = new Hono();

authRouter.post("/check-email", zValidator("json", checkEmailSchema), async (c: Context) => {
	try {
		const { email } = (await c.req.json()) as { email: string };

		const user = await db.query.user.findFirst({
			where: (table, { eq }) => eq(table.email, email.toLowerCase().trim()),
		});

		return c.json({ exists: !!user });
	} catch (error) {
		console.error("Error checking email:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Better Auth handler for all other auth routes
authRouter.on(["POST", "GET"], "/*", async (c: Context) => {
	try {
		return await auth.handler(c.req.raw);
	} catch (error) {
		console.error("Auth handler error:", error);
		return c.json({ error: "Authentication failed" }, 500);
	}
});

export default authRouter;
