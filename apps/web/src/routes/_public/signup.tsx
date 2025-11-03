import { SignupFormSkeleton } from "@/components/auth/skeletons/signup-form";
import { SignupForm } from "@/components/auth/signup-form";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_public/signup")({
	component: SignupPage,
});

function SignupPage() {
	return (
		<div className="flex min-h-svh w-full justify-center sm:items-center">
			<div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
				<Suspense fallback={<SignupFormSkeleton />}>
					<SignupForm />
				</Suspense>
			</div>
		</div>
	);
}
