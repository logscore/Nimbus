import { useNavigate, useLocation } from "@tanstack/react-router";
import { authClient } from "@nimbus/auth/auth-client";
import { useEffect } from "react";

interface RouteGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	redirectTo?: string;
}

export function RouteGuard({ children, requireAuth = false, redirectTo = "/signin" }: RouteGuardProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			// Check authentication status
			const isAuthenticated = !!session?.user;

			if (requireAuth && !isAuthenticated) {
				// Redirect to signin if auth is required but user isn't authenticated
				navigate({
					to: redirectTo,
					// search: { redirect: location.pathname },
				});
			} else if (!requireAuth && isAuthenticated && location.pathname === "/signin") {
				// Redirect to dashboard if already signed in and on signin page
				navigate({ to: "/dashboard" });
			}
		}
	}, [session, isPending, requireAuth, redirectTo, location.pathname, navigate]);

	// Show loading state while checking auth
	if (isPending) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	// Allow rendering if no auth requirement, or if authenticated
	const isAuthenticated = !!session?.user;
	const shouldRender = !requireAuth || isAuthenticated;

	return shouldRender ? <>{children}</> : null;
}
