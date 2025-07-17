import { user as userTable, type UserTableSelect } from "@nimbus/db/schema";
import { updateUserSchema, type UpdateUserSchema } from "@nimbus/shared";
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

		return sendSuccess(c, { data: user as UserTableSelect });
	})
	.put("/", zValidator("json", updateUserSchema), async c => {
		const data: UpdateUserSchema = c.req.valid("json");
		await c.var.db.update(userTable).set(data).where(eq(userTable.id, c.var.user.id));
		return sendSuccess(c, { message: "User updated successfully" });
	});

export default userRouter;
