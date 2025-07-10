import { GoogleDriveProvider } from "@/providers/google/google-drive";
// import { OneDriveProvider } from "@/providers/microsoft/one-drive";
import type { ProviderName } from "@/providers/interface/types";
import { type SessionUser } from "@nimbus/auth/auth";
import { getAccount } from "@/lib/utils/accounts";
// import OneDrive from "@/lib/one-drive/src";

const createDriveManager = (providerName: ProviderName, accessToken: string) => {
	if (providerName === "google") {
		return new GoogleDriveProvider(accessToken);
	}
	if (providerName === "microsoft") {
		// return new OneDriveProvider(accessToken);
	}
	throw new Error("Unsupported provider");
};

export const getDriveManagerForUser = async (user: SessionUser | null, headers: Headers) => {
	if (!user) {
		throw new Error("User not authenticated");
	}
	const account = await getAccount(user, headers);

	if (!account.accessToken || !account.providerId) {
		throw new Error("Missing account tokens");
	}

	const providerName = account.providerId as ProviderName;
	if (!["google", "microsoft"].includes(providerName)) {
		throw new Error(`Invalid provider: ${account.providerId}`);
	}

	return createDriveManager(providerName, account.accessToken);
};
