import type { UserTableSelect } from "@nimbus/db/schema";
import { createProtectedRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";

const userRouter = createProtectedRouter().get("/", async c => {
	try {
		const user = await c.var.db.query.user.findFirst({
			where: (table, { eq }) => eq(table.id, c.var.user.id),
		});

		if (!user) {
			return sendError(c, { message: "User not found" });
		}

		return sendSuccess(c, { data: user as UserTableSelect });
	} catch (error) {
		console.error("Error getting user:", error);
		return sendError(c);
	}
});

export default userRouter;
