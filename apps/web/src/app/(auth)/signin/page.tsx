import { SignInForm } from "@/components/auth/signin-form";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function SignInContent() {
	return (
		<div className="flex min-h-svh w-full justify-center sm:items-center">
			<div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
				<SignInForm />
			</div>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-svh w-full items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}
		>
			<SignInContent />
		</Suspense>
	);
}
