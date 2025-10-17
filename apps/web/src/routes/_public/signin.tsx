import { SigninFormSkeleton } from "@/components/auth/skeletons/signin-form";
import { SignInForm } from "@/components/auth/signin-form";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_public/signin")({
	component: SigninPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			redirectTo: (search.redirectTo as string) || undefined,
		};
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
