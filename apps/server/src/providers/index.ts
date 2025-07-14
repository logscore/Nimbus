import { driveProviderSchema, type DriveProvider } from "@nimbus/shared";
import { GoogleDriveProvider } from "@/providers/google/google-drive";
import { OneDriveProvider } from "@/providers/microsoft/one-drive";
import { type SessionUser } from "@nimbus/auth/auth";
import { getAccount } from "@/lib/utils/accounts";

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
