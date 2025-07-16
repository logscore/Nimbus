"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import type { SessionUser } from "@nimbus/auth/auth";
import { useGetUser } from "@/hooks/useGetUser";

interface DriveProviderState {
	user: SessionUser | null;
	accounts: Account[] | null;
	error: Error | null;
	isLoading: boolean;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
	const { data: user, error: userError, isPending: userIsPending } = useGetUser();
	const { data: accounts, error: accountsError, isPending: accountsIsPending } = useAccounts();

	const [state, setState] = useState<DriveProviderState>(() => ({
		user: null,
		accounts: null,
		error: null,
		isLoading: true,
	}));

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
		} else if (user) {
			setState(prev => ({
				...prev,
				user,
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
			}));
		}
	}, [accounts, accountsError, accountsIsPending]);

	const updateError = (error: Error) => {
		setState(prev => ({
			...prev,
			error,
			isLoading: false,
		}));
	};

	return <DriveProviderContext.Provider value={state}>{children}</DriveProviderContext.Provider>;
}

export function useUserInfoProvider() {
	const context = useContext(DriveProviderContext);
	if (context === undefined) {
		throw new Error("usage of useUserInfoProvider must be used within a UserInfoProvider");
	}
	return context;
}
