import { type AccountTableSelect } from "@nimbus/db/schema";
import { type SessionUser } from "@nimbus/auth/auth";
import { getProtectedContext } from "@/hono";

class AccountError extends Error {
	constructor(
		message: string,
		public code = "ACCOUNT_ERROR"
	) {
		super(message);
		this.name = "AccountError";
	}
}

export async function getAccount(user: SessionUser, headers: Headers): Promise<AccountTableSelect | null> {
	try {
		const c = getProtectedContext();
		const account = await c.var.db.query.account.findFirst({
			where: (table, { eq }) => eq(table.userId, user.id),
		});

		if (!account) {
			throw new AccountError(`No account found`, "ACCOUNT_NOT_FOUND");
		}

		const { accessToken } = await c.var.auth.api.getAccessToken({
			body: {
				providerId: account.providerId,
				accountId: account.id,
				userId: account.userId,
			},
			headers,
		});

		return {
			...account,
			accessToken: accessToken ?? account.accessToken,
		};
	} catch (error) {
		if (error instanceof AccountError) {
			throw error;
		}
		throw new AccountError("Failed to retrieve account information", "ACCOUNT_RETRIEVAL_FAILED");
	}
}
