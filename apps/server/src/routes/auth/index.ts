import { emailObjectSchema, type CheckEmailExists } from "@nimbus/shared";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { createPublicRouter } from "../../hono";

const authRouter = createPublicRouter()
	.post("/check-email", zValidator("json", emailObjectSchema), async c => {
		try {
			const { email } = (await c.req.json()) as { email: string };

			const user = await c.var.db.query.user.findFirst({
				where: (table, { eq }) => eq(table.email, email.toLowerCase().trim()),
			});

			const data: CheckEmailExists = {
				exists: !!user,
			};

			return sendSuccess(c, { data });
		} catch (error) {
			console.error("Error checking email:", error);
			return sendError(c);
		}
	})
	// Better Auth handler for all other auth routes
	.on(["POST", "GET"], "/*", async c => {
		try {
			return c.var.auth.handler(c.req.raw);
		} catch (error) {
			console.error("Auth handler error:", error);
			return sendError(c);
		}
	});

export default authRouter;
