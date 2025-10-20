import { emailObjectSchema, type CheckEmailExists } from "@nimbus/shared";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { type HonoContext } from "../../hono";
import { auth } from "@nimbus/auth/auth";
import { db } from "@nimbus/db";
import { Hono } from "hono";

// TODO(rate-limiting): implement for auth

const authRouter = new Hono<HonoContext>()
	.post("/check-email", zValidator("json", emailObjectSchema), async c => {
		try {
			const email = c.req.valid("json").email;

			const user = await db.query.user.findFirst({
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
			return auth.handler(c.req.raw);
		} catch (error) {
			console.error("Auth handler error:", error);
			return sendError(c);
		}
	});

export default authRouter;
