import { authClient } from "@nimbus/auth/auth-client";
import { PostHogProvider } from "posthog-js/react";
import { type ReactNode, useEffect } from "react";
import env from "@nimbus/env/client";
import posthog from "posthog-js";

export function PHProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		posthog.init(import.meta.env.VITE_POSTHOG_KEY!, {
			api_host: import.meta.env.VITE_POSTHOG_HOST,
			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
			defaults: "2025-05-24",
		});
	}, []);

	return (
		<PostHogProvider client={posthog}>
			<PostHogAuthWrapper>{children}</PostHogAuthWrapper>
		</PostHogProvider>
	);
}

function PostHogAuthWrapper({ children }: { children: ReactNode }) {
	const { data } = authClient.useSession();
	const user = data?.user;

	useEffect(() => {
		if (user) {
			posthog.identify(user.id, {
				email: user.email,
				name: user.name,
			});
		} else {
			posthog.reset();
		}
	}, [user]);

	return children;
}
