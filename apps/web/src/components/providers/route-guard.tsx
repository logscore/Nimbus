"use client";

import { authClient } from "@nimbus/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RouteGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	redirectTo?: string;
}

export function RouteGuard({ children, requireAuth = false, redirectTo = "/signin" }: RouteGuardProps) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			// Check authentication status
			const isAuthenticated = !!session?.user;

			if (requireAuth && !isAuthenticated) {
				// Redirect to signin if auth is required but user isn't authenticated
				const currentPath = window.location.pathname;
				const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
				router.push(redirectUrl);
			} else if (!requireAuth && isAuthenticated && window.location.pathname === "/signin") {
				// Redirect to dashboard if already signed in and on signin page
				router.push("/dashboard");
			}
		}
	}, [session, isPending, requireAuth, redirectTo, router]);

	// Show loading state while checking auth
	if (isPending) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	// Allow rendering if no auth requirement, or if authenticated
	const isAuthenticated = !!session?.user;
	const shouldRender = !requireAuth || isAuthenticated;

	return shouldRender ? <>{children}</> : null;
}
