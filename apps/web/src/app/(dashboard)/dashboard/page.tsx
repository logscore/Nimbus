"use client";

import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { LoadingStatePage } from "@/components/loading-state-page";

export default function DashboardPage() {
	const { error } = useUserInfoProvider();
	const title = "Loading your dashboard...";
	const description = "Please wait while we fetch your provider and account information.";
	const errorTitle = "Error loading your dashboard";
	const errorDescription = "Please try again later.";

	// DefaultAccountProvider navigates to the default account /dashboard/:providerSlug/:accountId, if on /dashboard. In layout.tsx

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
