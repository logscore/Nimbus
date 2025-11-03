import type { LimitedAccessAccount } from "@nimbus/shared";
import { createContext, useContext, useMemo } from "react";
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

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
	const { data: user, error: userError, isLoading: isUserLoading, refetch: refetchUser } = useGetUser();

	const {
		data: accounts,
		error: accountsError,
		isLoading: isAccountsLoading,
		refetch: refetchAccounts,
	} = useAccounts();

	const value = useMemo<DriveProviderState>(
		() => ({
			user: user || null,
			accounts: accounts || null,
			error: (userError || accountsError) as Error | null,
			isLoading: isUserLoading || isAccountsLoading,
			refreshUser: async () => {
				await refetchUser();
			},
			refreshAccounts: async () => {
				await refetchAccounts();
			},
		}),
		[user, accounts, userError, accountsError, isUserLoading, isAccountsLoading, refetchUser, refetchAccounts]
	);

	return <DriveProviderContext.Provider value={value}>{children}</DriveProviderContext.Provider>;
}

export function useUserInfoProvider() {
	const context = useContext(DriveProviderContext);
	if (context === undefined) {
		throw new Error("useUserInfoProvider must be used within a UserInfoProvider");
	}
	return context;
}
