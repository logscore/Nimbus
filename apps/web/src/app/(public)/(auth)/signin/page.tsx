import { SigninFormSkeleton } from "@/components/auth/skeletons/signin-form";
import { SignInForm } from "@/components/auth/signin-form";
import { Suspense } from "react";

export default function SigninPage() {
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
