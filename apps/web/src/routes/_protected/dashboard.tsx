import { DefaultAccountProvider } from "@/components/providers/default-account-provider";
import { UserInfoProvider } from "@/components/providers/user-info-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<UserInfoProvider>
			<DefaultAccountProvider>
				<Outlet />
			</DefaultAccountProvider>
		</UserInfoProvider>
	);
}
