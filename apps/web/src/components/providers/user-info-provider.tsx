"use client";

import type { DriveProvider, DriveProviderHeaders, DriveProviderSlug } from "@nimbus/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createProtectedClient, type DriveProviderClient } from "@/utils/client";
import { providerToSlug, slugToProvider } from "@nimbus/shared";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@nimbus/auth/auth";
import { useAccounts } from "@/hooks/useAccounts";
import { useGetUser } from "@/hooks/useGetUser";

interface Account {
	provider: string;
	accountId: string;
}

interface DriveProviderState {
	user: SessionUser | null;
	providerSlug: DriveProviderSlug | null;
	providerId: DriveProvider | null;
	accountId: string | null;
	accounts: Account[] | null;
	clientPromise: Promise<DriveProviderClient>;
	error: Error | null;
	isLoading: boolean;
	setDriveProvider: (newProviderSlug: string, newAccountId: string) => void;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
	const { data: user, error: userError, isPending: userIsPending } = useGetUser();
	const { data: accounts, error: accountsError, isPending: accountsIsPending } = useAccounts();
	const router = useRouter();
	const pathname = usePathname();

	const [{ clientPromise, resolveClient }] = useState(() => {
		let resolver: (client: DriveProviderClient) => void;
		const promise = new Promise<DriveProviderClient>(resolve => {
			resolver = resolve;
		});
		return {
			clientPromise: promise,
			resolveClient: resolver!,
		};
	});

	const [state, setState] = useState<Omit<DriveProviderState, "setDriveProvider" | "navigateToProvider">>(() => ({
		user: null,
		providerSlug: null,
		providerId: null,
		accountId: null,
		accounts: null,
		clientPromise,
		error: null,
		isLoading: true,
	}));

	useEffect(() => {
		if (!userError && state.providerId && state.accountId) {
			const headers: DriveProviderHeaders = {
				"X-Provider-Id": state.providerId,
				"X-Account-Id": state.accountId,
			};
			console.log({ headers });
			const client = createProtectedClient({ headers });
			resolveClient(client);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userError, state.providerId, state.accountId]);

	useEffect(() => {
		if (userIsPending || accountsIsPending) {
			setState(prev => ({ ...prev, isLoading: true }));
			return;
		} else if (!userIsPending && !accountsIsPending) {
			setState(prev => ({ ...prev, isLoading: false }));
		}
	}, [userIsPending, accountsIsPending]);

	useEffect(() => {
		if (userError) {
			updateError(userError);
			return;
		}
		if (userIsPending) {
			setState(prev => ({ ...prev, isLoading: true }));
			return;
		} else if (user && user.defaultProviderId && user.defaultAccountId) {
			const providerSlug = providerToSlug(user.defaultProviderId as DriveProvider);
			if (!providerSlug) {
				updateError(new Error("Invalid provider slug"));
				return;
			}
			const providerId = slugToProvider(providerSlug);
			if (!providerId) {
				updateError(new Error("Invalid provider id"));
				return;
			}
			setState(prev => ({
				...prev,
				user,
				providerSlug,
				providerId,
				accountId: user.defaultAccountId,
				accounts: prev.accounts,
				error: null,
			}));
		}
	}, [user, userError, userIsPending]);

	useEffect(() => {
		if (accountsError) {
			updateError(accountsError);
			return;
		}
		if (accountsIsPending) {
			setState(prev => ({ ...prev, isLoading: true }));
			return;
		} else if (accounts) {
			setState(prev => ({
				...prev,
				accounts,
				error: null,
			}));
		}
	}, [accounts, accountsError, accountsIsPending]);

	useEffect(() => {
		navigateToProvider();
		// Not dependent on the function
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.providerSlug, state.accountId]);

	const navigateToProvider = () => {
		const providerSlug = state.providerSlug;
		const accountId = state.accountId;
		if (!state.user || !providerSlug || !accountId) {
			return;
		}
		const path = `/dashboard/${providerSlug}/${accountId}`;
		if (pathname !== path) {
			router.push(path);
		}
	};

	const setDriveProvider = (newProviderSlug: string, newAccountId: string) => {
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
		<DriveProviderContext.Provider
			value={{
				...state,
				setDriveProvider,
			}}
		>
			{children}
		</DriveProviderContext.Provider>
	);
}

export function useUserInfoProvider() {
	const context = useContext(DriveProviderContext);
	if (context === undefined) {
		throw new Error("useUserInfoProvider must be used within a UserInfoProvider");
	}
	return context;
}
