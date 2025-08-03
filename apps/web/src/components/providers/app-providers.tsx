"use client";

import { SigninAccountDialog } from "@/components/auth/signin-account-dialog";
import { AuthProvider, useAuth } from "./auth-provider";
import { setAuthContext } from "@/utils/client";
import type { ReactNode } from "react";

// This component wraps the auth provider with the sign-in dialog
function AuthWrapper({ children }: { children: ReactNode }) {
	const { showSignIn, openSignIn, closeSignIn } = useAuth();

	// Set the auth context so it can be accessed outside of React components
	setAuthContext({ openSignIn });

	return (
		<>
			{children}
			<SigninAccountDialog open={showSignIn} onOpenChange={open => (open ? openSignIn() : closeSignIn())} />
		</>
	);
}

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<AuthWrapper>{children}</AuthWrapper>
		</AuthProvider>
	);
}
