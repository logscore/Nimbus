"use client";

import type {
	DriveProvider,
	DriveProviderHeaders,
	DriveProviderSlug,
	DriveProviderSlugParamSchema,
} from "@nimbus/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createProtectedClient, type DriveProviderClient } from "@/utils/client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { providerToSlug, slugToProvider } from "@nimbus/shared";

interface AccountProvider {
	providerSlug: DriveProviderSlug | null;
	providerId: DriveProvider | null;
	accountId: string | null;
	clientPromise: Promise<DriveProviderClient>;
	error: Error | null;
	isLoading: boolean;
	setDriveProviderById: (providerId: string, accountId: string) => void;
}

const AccountProviderContext = createContext<AccountProvider | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { providerSlug: providerSlugParam, accountId: accountIdParam } = useParams<DriveProviderSlugParamSchema>();

	const [{ clientPromise, resolveClient }] = useState(() => {
		let resolveClient: (client: DriveProviderClient) => void;
		const promise = new Promise<DriveProviderClient>(resolve => {
			resolveClient = resolve;
		});
		return {
			clientPromise: promise,
			resolveClient: resolveClient!,
		};
	});

	const [state, setState] = useState<Omit<AccountProvider, "setDriveProviderById">>(() => ({
		providerSlug: null,
		providerId: null,
		accountId: null,
		clientPromise,
		error: null,
		isLoading: true,
	}));

	useEffect(() => {
		if (!state.error && state.providerId && state.accountId) {
			const headers: DriveProviderHeaders = {
				"X-Provider-Id": state.providerId,
				"X-Account-Id": state.accountId,
			};

			const client = createProtectedClient({ headers });
			resolveClient(client);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.error, state.providerId, state.accountId]);

	useEffect(() => {
		if (providerSlugParam && accountIdParam) {
			setDriveProviderBySlug(providerSlugParam, accountIdParam);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [providerSlugParam, accountIdParam]);

	useEffect(() => {
		navigateToProvider();
		// Not dependent on the function
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.providerSlug, state.accountId]);

	const navigateToProvider = () => {
		const providerSlug = state.providerSlug;
		const accountId = state.accountId;
		if (!providerSlug || !accountId) {
			return;
		}
		const path = `/dashboard/${providerSlug}/${accountId}`;
		if (pathname !== path) {
			router.push(path);
		}
	};

	const setDriveProviderById = (newProviderId: string, newAccountId: string) => {
		const providerSlug = providerToSlug(newProviderId as DriveProvider);
		if (!providerSlug) {
			updateError(new Error("Invalid provider id"));
			return;
		}
		const providerId = slugToProvider(providerSlug);
		if (!providerId) {
			updateError(new Error("Invalid provider slug"));
			return;
		}
		setState(prev => ({
			...prev,
			providerId,
			providerSlug,
			accountId: newAccountId,
		}));
	};

	const setDriveProviderBySlug = (newProviderSlug: string, newAccountId: string) => {
		const providerId = slugToProvider(newProviderSlug as DriveProviderSlug);
		if (!providerId) {
			updateError(new Error("Invalid provider slug"));
			return;
		}
		const providerSlug = providerToSlug(providerId);
		if (!providerSlug) {
			updateError(new Error("Invalid provider id"));
			return;
		}
		setState(prev => {
			if (prev.providerSlug === providerSlug && prev.providerId === providerId && prev.accountId === newAccountId) {
				return prev;
			}
			return {
				...prev,
				providerSlug,
				providerId,
				accountId: newAccountId,
			};
		});
	};

	const updateError = (error: Error) => {
		setState(prev => ({
			...prev,
			error,
			isLoading: false,
		}));
	};

	return (
		<AccountProviderContext.Provider
			value={{
				...state,
				setDriveProviderById,
			}}
		>
			{children}
		</AccountProviderContext.Provider>
	);
}

export function useAccountProvider() {
	const context = useContext(AccountProviderContext);
	if (context === undefined) {
		throw new Error("usage of useAccountProvider must be used within a AcountProvider");
	}
	return context;
}
