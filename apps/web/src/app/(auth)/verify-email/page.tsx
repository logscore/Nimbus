import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { Suspense } from "react";

export default function VerifyEmailPage() {
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
