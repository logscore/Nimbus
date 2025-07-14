import { GoogleDriveProvider } from "@/providers/google/google-drive";
import { OneDriveProvider } from "@/providers/microsoft/one-drive";
import { type SessionUser } from "@nimbus/auth/auth";
import type { DriveProvider } from "@nimbus/shared";
import { getAccount } from "@/lib/utils/accounts";

const createDriveProvider = (providerName: DriveProvider, accessToken: string) => {
	if (providerName === "google") {
		return new GoogleDriveProvider(accessToken);
	}
	if (providerName === "microsoft") {
		return new OneDriveProvider(accessToken);
	}
	throw new Error("Unsupported provider");
};

export const getDriveProvider = async (user: SessionUser | null, headers: Headers) => {
	if (!user) {
		throw new Error("User not authenticated");
	}
	const account = await getAccount(user, headers);

	if (!account.accessToken || !account.providerId) {
		throw new Error("Missing account tokens");
	}

	const providerName = account.providerId as DriveProvider;
	if (!["google", "microsoft"].includes(providerName)) {
		throw new Error(`Invalid provider: ${account.providerId}`);
	}

	return createDriveProvider(providerName, account.accessToken);
};
