"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LimitedAccessAccount } from "@nimbus/shared";
import type { SessionUser } from "@nimbus/auth/auth";
import { useAccounts } from "@/hooks/useAccounts";
import { useGetUser } from "@/hooks/useGetUser";

interface DriveProviderState {
	user: SessionUser | null;
	accounts: LimitedAccessAccount[] | null;
	error: Error | null;
	isLoading: boolean;
	refreshUser: () => Promise<void>;
	refreshAccounts: () => Promise<void>;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
	const { data: user, error: userError, isPending: userIsPending, refetch: refetchUser } = useGetUser();
	const {
		data: accounts,
		error: accountsError,
		isPending: accountsIsPending,
		refetch: refetchAccounts,
	} = useAccounts();

	const [state, setState] = useState<Omit<DriveProviderState, "refreshUser" | "refreshAccounts">>(() => ({
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

	const refreshUser = async () => {
		return await refetchUser();
	};

	const refreshAccounts = async () => {
		return await refetchAccounts();
	};

	const updateError = (error: Error) => {
		setState(prev => ({
			...prev,
			error,
			isLoading: false,
		}));
	};

	return (
		<DriveProviderContext.Provider value={{ ...state, refreshUser, refreshAccounts }}>
			{children}
		</DriveProviderContext.Provider>
	);
}

export function useUserInfoProvider() {
	const context = useContext(DriveProviderContext);
	if (context === undefined) {
		throw new Error("usage of useUserInfoProvider must be used within a UserInfoProvider");
	}
	return context;
}
