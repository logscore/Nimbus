import { driveProviderSchema, updateUserSchema, type UpdateUserSchema } from "@nimbus/shared";
import { user as userTable } from "@nimbus/db/schema";
import { createProtectedRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

const userRouter = createProtectedRouter()
	.get("/", async c => {
		const user = await c.var.db.query.user.findFirst({
			where: (table, { eq }) => eq(table.id, c.var.user.id),
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

		const account = await c.var.db.query.account.findFirst({
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
	})
	.put("/", zValidator("json", updateUserSchema), async c => {
		const data: UpdateUserSchema = c.req.valid("json");
		await c.var.db.update(userTable).set(data).where(eq(userTable.id, c.var.user.id));
		return sendSuccess(c, { message: "User updated successfully" });
	});

export default userRouter;
