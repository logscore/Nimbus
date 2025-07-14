import { emailObjectSchema } from "@nimbus/shared";
import { zValidator } from "@hono/zod-validator";
import { createPublicRouter } from "@/hono";
import { sendError } from "../utils";

const authRouter = createPublicRouter();

authRouter.post("/check-email", zValidator("json", emailObjectSchema), async c => {
	try {
		const { email } = (await c.req.json()) as { email: string };

		const user = await c.var.db.query.user.findFirst({
			where: (table, { eq }) => eq(table.email, email.toLowerCase().trim()),
		});

		return c.json({ exists: !!user });
	} catch (error) {
		console.error("Error checking email:", error);
		return sendError(c);
	}
});

// Better Auth handler for all other auth routes
authRouter.on(["POST", "GET"], "/*", async c => {
	try {
		return c.var.auth.handler(c.req.raw);
	} catch (error) {
		console.error("Auth handler error:", error);
		return sendError(c);
	}
});

export default authRouter;
