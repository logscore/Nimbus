import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { LoadingStatePage } from "@/components/loading-state-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { error } = useUserInfoProvider();
	const title = "Loading your dashboard...";
	const description = "Please wait while we fetch your provider and account information.";
	const errorTitle = "Error loading your dashboard";
	const errorDescription = "Please try again later.";

	// DefaultAccountProvider navigates to the default account /dashboard/:providerSlug/:accountId

	return (
		<LoadingStatePage
			error={error}
			title={title}
			description={description}
			errorTitle={errorTitle}
			errorDescription={errorDescription}
		/>
	);
}
