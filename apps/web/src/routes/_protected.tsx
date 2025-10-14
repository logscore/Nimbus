import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@nimbus/auth/auth-client";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ location }) => {
		try {
			// Check if user is authenticated
			const session = await authClient.getSession();

			if (!session?.data?.user) {
				// Redirect to signin with the current path as redirect parameter
				throw redirect({
					to: "/signin",
					search: {
						redirect: location.pathname,
					},
				});
			}

			// Return session data to be available in route context
			return {
				session,
			};
		} catch (error) {
			// If it's already a redirect, re-throw it
			if (error instanceof Error && error.message.includes("redirect")) {
				throw error;
			}

			// For other errors, redirect to signin
			throw redirect({
				to: "/signin",
				search: {
					redirect: location.pathname,
				},
			});
		}
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return <Outlet />;
}
