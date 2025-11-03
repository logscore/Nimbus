import { SigninFormSkeleton } from "@/components/auth/skeletons/signin-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInForm } from "@/components/auth/signin-form";
import { authClient } from "@nimbus/auth/auth-client";
import { Suspense } from "react";

export const Route = createFileRoute("/_public/signin")({
	component: SigninPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			redirectTo: (search.redirectTo as string) || undefined,
		};
	},
	beforeLoad: async () => {
		const session = await authClient.getSession();
		console.log(session.data);
		if (session.data?.session) {
			return redirect({ to: "/dashboard" });
		}
	},
});

function SigninPage() {
	return (
		<div className="flex min-h-svh w-full justify-center sm:items-center">
			<div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
				<Suspense fallback={<SigninFormSkeleton />}>
					<SignInForm />
				</Suspense>
			</div>
		</div>
	);
}
