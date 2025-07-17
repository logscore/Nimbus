import {
	type DriveProvider,
	type DriveProviderHeaders,
	type DriveProviderSlug,
	type DriveProviderSlugParamSchema,
	providerToSlug,
	slugToProvider,
} from "@nimbus/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createProtectedClient, type DriveProviderClient } from "@/utils/client";
import { useParams, usePathname, useRouter } from "next/navigation";

interface AccountProviderContextType {
	providerId: string | null;
	providerSlug: string | null;
	accountId: string | null;
	clientPromise: Promise<DriveProviderClient>;
	setDriveProviderById: (providerId: string, accountId: string) => void;
}

const createClient = (providerId: string | null, accountId: string | null): Promise<DriveProviderClient> => {
	if (!providerId || !accountId) {
		return new Promise<DriveProviderClient>(() => {});
	}

	const headers: DriveProviderHeaders = {
		"X-Provider-Id": providerId,
		"X-Account-Id": accountId,
	};

	return Promise.resolve(createProtectedClient({ headers }));
};

const AccountProviderContext = createContext<AccountProviderContextType | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { providerSlug: providerSlugParam, accountId: accountIdParam } = useParams<DriveProviderSlugParamSchema>();

	const [providerSlug, setProviderSlug] = useState<string | null>(providerSlugParam);
	const [providerId, setProviderId] = useState<string | null>(
		slugToProvider(providerSlug as DriveProviderSlug) ?? null
	);
	const [accountId, setAccountId] = useState<string | null>(accountIdParam);

	const clientPromise = useMemo(() => createClient(providerId, accountId), [providerId, accountId]);

	const navigateToProvider = useCallback(
		(newProviderSlug: string, newAccountId: string) => {
			const newPathname = `/dashboard/${newProviderSlug}/${newAccountId}`;
			if (pathname !== newPathname) {
				router.push(newPathname);
			}
		},
		[pathname, router]
	);

	const setDriveProviderById = useCallback(
		(newProviderId: string, newAccountId: string) => {
			const newProviderSlug = providerToSlug(newProviderId as DriveProvider);
			if (!newProviderSlug) {
				throw new Error("Invalid provider ID");
			}
			navigateToProvider(newProviderSlug, newAccountId);
			setProviderId(newProviderId);
			setProviderSlug(newProviderSlug);
			setAccountId(newAccountId);
		},
		[navigateToProvider]
	);

	// Update state when URL params change
	useEffect(() => {
		const newProviderId = slugToProvider(providerSlugParam as DriveProviderSlug) ?? null;
		const newAccountId = accountIdParam;

		// Only update state if values have actually changed
		if (newProviderId !== providerId || newAccountId !== accountId) {
			setProviderId(newProviderId);
			setProviderSlug(providerSlugParam);
			setAccountId(newAccountId);
		}
	}, [providerSlugParam, accountIdParam, providerId, accountId]);

	const value = useMemo(
		() => ({
			providerId,
			providerSlug,
			accountId,
			clientPromise,
			setDriveProviderById,
		}),
		[providerId, providerSlug, accountId, clientPromise, setDriveProviderById]
	);

	return <AccountProviderContext.Provider value={value}>{children}</AccountProviderContext.Provider>;
}

export function useAccountProvider() {
	const context = useContext(AccountProviderContext);

	if (!context) {
		throw new Error("useAccountProvider must be used within an AccountProvider");
	}

	return context;
}
