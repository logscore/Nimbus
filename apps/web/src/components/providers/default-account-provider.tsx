import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DriveProvider, DriveProviderSlug } from "@nimbus/shared";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { providerToSlug, slugToProvider } from "@nimbus/shared";
import { useUserInfoProvider } from "./user-info-provider";

interface AccountProvider {
	defaultProviderSlug: DriveProviderSlug | null;
	defaultProviderId: DriveProvider | null;
	defaultAccountId: string | null;
	error: Error | null;
	isLoading: boolean;
}

const DefaultAccountProviderContext = createContext<AccountProvider | undefined>(undefined);

export function DefaultAccountProvider({ children }: { children: ReactNode }) {
	const { user, error: userInfoError, isLoading: userInfoIsPending } = useUserInfoProvider();
	const navigate = useNavigate();
	const location = useLocation();
	const pathname = location.pathname;

	const [state, setState] = useState<AccountProvider>(() => ({
		defaultProviderSlug: null,
		defaultProviderId: null,
		defaultAccountId: null,
		error: null,
		isLoading: true,
	}));

	useEffect(() => {
		const defaultProviderId = user?.defaultProviderId;
		const defaultAccountId = user?.defaultAccountId;
		if (userInfoError) {
			updateError(userInfoError);
			return;
		}
		if (userInfoIsPending && !state.defaultProviderId && !state.defaultAccountId) {
			setState(prev => ({ ...prev, isLoading: true }));
			return;
		} else if (user && defaultProviderId && defaultAccountId) {
			const providerSlug = providerToSlug(defaultProviderId as DriveProvider);
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
				defaultProviderSlug: providerSlug,
				defaultProviderId: providerId,
				defaultAccountId: defaultAccountId,
				error: null,
				isLoading: false,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, userInfoError, userInfoIsPending]);

	useEffect(() => {
		if (pathname !== "/dashboard") {
			return;
		}
		navigateToProvider();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, state.defaultProviderSlug, state.defaultAccountId]);

	const navigateToProvider = () => {
		const providerSlug = state.defaultProviderSlug;
		const accountId = state.defaultAccountId;
		if (!user || !providerSlug || !accountId) {
			return;
		}
		const path = `/dashboard/${providerSlug}/${accountId}`;
		if (pathname !== path) {
			navigate({ to: path as any });
		}
	};

	const updateError = (error: Error) => {
		setState(prev => ({
			...prev,
			error,
			isLoading: false,
		}));
	};

	return <DefaultAccountProviderContext.Provider value={state}>{children}</DefaultAccountProviderContext.Provider>;
}

export function useDefaultAccountProvider() {
	const context = useContext(DefaultAccountProviderContext);
	if (context === undefined) {
		throw new Error("usage of useDefaultAccountProvider must be used within a DefaultAccountProvider");
	}
	return context;
}
