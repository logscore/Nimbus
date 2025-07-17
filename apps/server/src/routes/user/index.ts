import type { UserTableSelect } from "@nimbus/db/schema";
import { createProtectedRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";

const userRouter = createProtectedRouter().get("/", async c => {
	const user = await c.var.db.query.user.findFirst({
		where: (table, { eq }) => eq(table.id, c.var.user.id),
	});

	if (!user) {
		return sendError(c, { message: "User not found" });
	}

	return sendSuccess(c, { data: user as UserTableSelect });
});

export default userRouter;
