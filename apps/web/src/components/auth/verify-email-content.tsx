"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthErrorCard } from "./shared/auth-error-card";
import { type ComponentProps, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import env from "@nimbus/env/client";
import { toast } from "sonner";
import Link from "next/link";

export function VerifyEmailContent({ ...props }: ComponentProps<"div">) {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const token = searchParams.get("token");
	const [isLoading, setIsLoading] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const callbackURL = searchParams.get("callbackURL");

	const onClick = async () => {
		if (!token) return;
		setIsLoading(true);
		try {
			await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-email`, {
				withCredentials: true,
				params: {
					token,
					callbackURL,
				},
			});
			onSuccess();
		} catch (error) {
			if (!(error instanceof AxiosError)) {
				console.error(error);
				toast.error("Failed to verify email. Please try again.");
			} else {
				onSuccess();
			}
		} finally {
			setIsLoading(false);
		}
	};

	const onSuccess = () => {
		setIsVerified(true);
		toast.success("Email verified successfully");
	};

	if (error === "invalid_token" || !token) {
		return (
			<AuthErrorCard
				title="Invalid Email Change Link"
				content="This email change link is invalid or has expired. Please request a new email change link to continue."
				actionText="Request to Change Email"
				actionHref="/dashboard/settings"
			/>
		);
	}

	return (
		<div className="flex size-full flex-col items-center justify-center gap-0 select-none" {...props}>
			<Card className="w-full max-w-md gap-6 py-0 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href="/">
								<ArrowLeft />
								Back to Home
							</Link>
						</Button>
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">Verify Email</CardTitle>
						<CardDescription className="text-center text-xs md:text-sm">
							Click the button below to verify your email.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="flex items-center justify-center px-6">
					<Button onClick={onClick} disabled={isLoading || isVerified}>
						{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						{isVerified ? "Email Verified" : "Verify Email"}
					</Button>
				</CardContent>

				<CardFooter className="px-6 py-4">
					<p className="w-full text-center text-sm text-neutral-600">
						By continuing, you agree to our{" "}
						<Link href="/terms" className="cursor-pointer whitespace-nowrap underline underline-offset-4">
							terms of service
						</Link>
						.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
