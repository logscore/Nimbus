import { type SessionUser } from "@nimbus/auth/auth";
import { getContext } from "hono/context-storage";
import type { HonoContext } from "@/ctx";

class AccountError extends Error {
	constructor(
		message: string,
		public code = "ACCOUNT_ERROR"
	) {
		super(message);
		this.name = "AccountError";
	}
}

export const getAccount = async (user: SessionUser | null, headers: Headers) => {
	if (!user?.id) {
		throw new AccountError("User session does not exist", "USER_SESSION_DOES_NOT_EXIST");
	}

	try {
		const c = getContext<HonoContext>();
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
};
