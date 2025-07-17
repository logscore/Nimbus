import { limitedAccessAccountSchema, updateAccountSchema, type UpdateAccountSchema } from "@nimbus/shared";
import { account as accountTable } from "@nimbus/db/schema";
import { createProtectedRouter } from "../../hono";
import { zValidator } from "@hono/zod-validator";
import { sendSuccess } from "../utils";
import { eq } from "drizzle-orm";

const accountRouter = createProtectedRouter()
	.get("/", async c => {
		const accounts = await c.var.db.query.account.findMany({
			where: (table, { eq }) => eq(table.userId, c.var.user.id),
		});
		const limitedAccessAccounts = accounts.map(account => ({
			id: account.id,
			providerId: account.providerId,
			accountId: account.accountId,
			scope: account.scope,
			nickname: account.nickname,
			createdAt: account.createdAt,
			updatedAt: account.updatedAt,
		}));
		const limitedAccessAccountsParsed = limitedAccessAccountSchema.array().parse(limitedAccessAccounts);
		return sendSuccess(c, { data: limitedAccessAccountsParsed });
	})
	.put("/", zValidator("json", updateAccountSchema), async c => {
		const data: UpdateAccountSchema = c.req.valid("json");
		const metadata = { nickname: data.nickname };
		await c.var.db.update(accountTable).set(metadata).where(eq(accountTable.id, data.id));
		return sendSuccess(c, { message: "Account updated successfully" });
	});

export default accountRouter;
