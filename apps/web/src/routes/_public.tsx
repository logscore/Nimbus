import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@nimbus/auth/auth-client";

export const Route = createFileRoute("/_public")({
	beforeLoad: async ({ location }) => {
		try {
			// Check if user is authenticated
			const session = await authClient.getSession();

			// If user is authenticated and trying to access signin/signup, redirect to dashboard
			if (session?.data?.user) {
				const authPaths = ["/signin", "/signup"];
				if (authPaths.includes(location.pathname)) {
					throw redirect({
						to: "/dashboard",
					});
				}
			}
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error instanceof Error && error.message.includes("redirect")) {
				throw error;
			}
			// For other errors, just continue (allow access to public routes)
			console.error("Auth check error in public route:", error);
		}
	},
	component: PublicLayout,
});

function PublicLayout() {
	return <Outlet />;
}
