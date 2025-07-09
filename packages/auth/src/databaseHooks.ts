import type { SessionTableInsert } from "@nimbus/db/schema";
import { user as userTable } from "@nimbus/db/schema";
import type { Account, Session } from "better-auth";
import { eq } from "drizzle-orm";
import { db } from "@nimbus/db";

export async function afterAccountCreation(account: Account) {
	const user = await db.query.user.findFirst({
		where: (table, { eq }) => eq(table.id, account.userId),
	});

	if (!user || user.defaultProviderId) {
		return;
	}

	const defaultProviderId = account.providerId;

	await db.update(userTable).set({ defaultProviderId }).where(eq(userTable.id, account.userId));
}

export async function beforeSessionCreation(session: Session): Promise<{ data: SessionTableInsert }> {
	const account = (await db.query.account.findFirst({
		where: (table, { eq }) => eq(table.userId, session.userId),
	})) as Account;

	const providerId = account.providerId;

	return {
		data: {
			...session,
			providerId,
		},
	};
}
