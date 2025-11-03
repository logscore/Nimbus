import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_public/reset-password")({
	component: ResetPasswordPage,
	validateSearch: (search: Record<string, string>) => ({
		token: search.token as string,
		error: search.error as string,
	}),
});

function ResetPasswordContent() {
	return (
		<div className="flex min-h-svh w-full justify-center sm:items-center">
			<div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
				<ResetPasswordForm />
			</div>
		</div>
	);
}

function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordContent />
		</Suspense>
	);
}
