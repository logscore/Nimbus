"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SessionUser } from "@nimbus/auth/auth";
// import { authClient } from "@nimbus/auth/auth-client";
import { useGetUser } from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";

interface DriveProviderState {
	user: SessionUser | null;
	providerId: string | null;
	accountId: string | null;
	error: Error | null;
	isLoading: boolean;
	setDriveProvider: (providerId: string, accountId: string) => void;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
	// get user.defaultProviderId and user.defaultAccountId from backend cause it is not included on session.user
	const { data: user, error: userError, isPending: userIsPending } = useGetUser();
	// const { data: session, error: sessionError, isPending: sessionIsPending } = authClient.useSession();
	const router = useRouter();
	const [state, setState] = useState<Omit<DriveProviderState, "setDriveProvider" | "navigateToProvider">>({
		user: null,
		providerId: null,
		accountId: null,
		error: null,
		isLoading: true,
	});

	// Handle session errors
	useEffect(() => {
		// if (sessionError) {
		// 	const normalError = sessionError?.status
		// 		? new Error(sessionError.statusText)
		// 		: new Error("Failed to fetch session");
		// 	updateError(normalError);
		// }
		if (userError) {
			updateError(userError);
		}
		// }, [sessionError, userError]);
	}, [userError]);

	// Initialize with default values from session
	useEffect(() => {
		if (userIsPending) {
			setState(prev => ({ ...prev, isLoading: true }));
			return;
		} else if (user && user.defaultProviderId && user.defaultAccountId) {
			setState({
				user,
				providerId: user.defaultProviderId,
				accountId: user.defaultAccountId,
				error: null,
				isLoading: false,
			});
		}
		// }, [session?.user, user, userIsPending, sessionIsPending]);
	}, [user, userIsPending]);

	useEffect(() => {
		navigateToProvider();
		// Not dependent on the function
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.providerId, state.accountId]);

	const updateError = (error: Error) => {
		setState(prev => ({
			...prev,
			error,
			isLoading: false,
		}));
	};

	const navigateToProvider = () => {
		const providerId = state.providerId;
		const accountId = state.accountId;
		if (!state.user || !providerId || !accountId) {
			return;
		}
		router.push(`/dashboard/${providerId}/${accountId}`);
	};

	const setDriveProvider = (providerId: string, accountId: string) => {
		if (!state.user || !state.providerId || !state.accountId) {
			console.error("Cannot set provider without user session or providerId or accountId");
			return;
		}
		setState(prev => ({
			...prev,
			providerId,
			accountId,
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
