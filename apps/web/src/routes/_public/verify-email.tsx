import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_public/verify-email")({
	component: VerifyEmailPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			token: (search.token as string) || undefined,
			error: (search.error as string) || undefined,
		};
	},
});

function VerifyEmailPage() {
	return (
		<Suspense>
			<div className="flex min-h-svh w-full justify-center sm:items-center">
				<div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
					<VerifyEmailContent />
				</div>
			</div>
		</Suspense>
	);
}
