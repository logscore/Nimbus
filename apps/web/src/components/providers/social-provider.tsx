"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { SocialProvider } from "@nimbus/shared";

interface SocialContextType {
	provider: SocialProvider | null;
	setProvider: (provider: SocialProvider) => void;
	clearProvider: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
	const [provider, setProviderState] = useState<SocialProvider | null>(null);

	const setProvider = useCallback((newProvider: SocialProvider) => {
		setProviderState(newProvider);
	}, []);

	const clearProvider = useCallback(() => {
		setProviderState(null);
	}, []);

	return <SocialContext.Provider value={{ provider, setProvider, clearProvider }}>{children}</SocialContext.Provider>;
}

export function useSocialProvider() {
	const context = useContext(SocialContext);
	if (context === undefined) {
		throw new Error("useSocialProvider must be used within a SocialProvider");
	}
	return context;
}
