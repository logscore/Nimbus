import { driveProviderSchema, updateUserSchema, type UpdateUserSchema } from "@nimbus/shared";
import { sendError, sendSuccess, sendUnauthorized } from "../utils";
import { createRateLimiter } from "@nimbus/cache/rate-limiters";
import { user as userTable } from "@nimbus/db/schema";
import { securityMiddleware } from "../../middleware";
import { zValidator } from "@hono/zod-validator";
import { type HonoContext } from "../../hono";
import { cacheClient } from "@nimbus/cache";
import { eq } from "drizzle-orm";
import { db } from "@nimbus/db";
import { Hono } from "hono";

// TODO(rate-limiting): implement for user

const userRouter = new Hono<HonoContext>()
	.get(
		"/",
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-user-`,
					}),
			},
		}),
		async c => {
			const userId = c.var.user?.id;
			if (!userId) {
				return sendUnauthorized(c, "Unauthorized");
			}

			const user = await db.query.user.findFirst({
				where: (table, { eq }) => eq(table.id, userId),
			});

			if (!user) {
				return sendError(c, { message: "User not found" });
			}

			const { defaultProviderId, defaultAccountId } = user;
			if (!defaultProviderId || !defaultAccountId) {
				return sendError(c, { message: "User does not have a default account configured" });
			}

			const parsedDefaultProvider = driveProviderSchema.safeParse(defaultProviderId);
			if (!parsedDefaultProvider.success) {
				return sendError(c, { message: "Invalid default provider" });
			}

			const account = await db.query.account.findFirst({
				where: (table, { and, eq }) =>
					and(
						eq(table.userId, user.id),
						eq(table.providerId, parsedDefaultProvider.data),
						eq(table.accountId, defaultAccountId)
					),
			});

			if (!account) {
				return sendError(c, { message: "Default account not found" });
			}

			return sendSuccess(c, { data: user });
		}
	)
	.put(
		"/",
		zValidator("json", updateUserSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `put-user-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}

			const data: UpdateUserSchema = c.req.valid("json");

			await db.update(userTable).set(data).where(eq(userTable.id, user.id));

			return sendSuccess(c, { message: "User updated successfully" });
		}
	);

export default userRouter;
