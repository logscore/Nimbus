"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authClient } from "@nimbus/auth/auth-client";
import type { SessionUser } from "@nimbus/auth/auth";

interface DriveProviderState {
	user: SessionUser | null;
	providerId: string | null;
	accountId: string | null;
	isLoading: boolean;
	setDriveProvider: (providerId: string, accountId: string) => void;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const [state, setState] = useState<Omit<DriveProviderState, "setDriveProvider">>({
		user: null,
		providerId: null,
		accountId: null,
		isLoading: true,
	});

	// Initialize with default values from session
	useEffect(() => {
		const user = session?.user as SessionUser | undefined;
		if (isPending) {
			setState(prev => ({ ...prev, isLoading: true }));
		} else if (!user) {
			setState({ user: null, providerId: null, accountId: null, isLoading: false });
		} else {
			setState({
				user,
				providerId: user.defaultProviderId ?? null,
				accountId: user.defaultAccountId ?? null,
				isLoading: false,
			});
		}
	}, [session?.user, isPending]);

	const setDriveProvider = (providerId: string, accountId: string) => {
		if (!state.user) return;

		setState(prev => ({
			...prev,
			providerId,
			accountId,
			isLoading: true,
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
