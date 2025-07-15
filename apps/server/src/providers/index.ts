import { driveProviderSchema, type DriveProvider } from "@nimbus/shared";
import { GoogleDriveProvider } from "./google/google-drive";
import { type AccountTableSelect } from "@nimbus/db/schema";
import { OneDriveProvider } from "./microsoft/one-drive";
import { type SessionUser } from "@nimbus/auth/auth";
import { getProtectedContext } from "../hono";

function createDriveProvider(providerName: DriveProvider, accessToken: string) {
	if (providerName === "google") {
		return new GoogleDriveProvider(accessToken);
	}
	if (providerName === "microsoft") {
		return new OneDriveProvider(accessToken);
	}
	throw new Error("Unsupported provider");
}

export async function getDriveProvider(user: SessionUser, headers: Headers) {
	const account = await getAccount(user, headers);

	if (!account || !account.accessToken || !account.providerId || !account.accountId) {
		throw new Error("Missing account tokens");
	}

	const parsedProviderName = driveProviderSchema.parse(account.providerId);
	if (parsedProviderName !== account.providerId) {
		throw new Error(`Invalid provider: ${account.providerId}`);
	}

	return createDriveProvider(parsedProviderName, account.accessToken);
}

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
