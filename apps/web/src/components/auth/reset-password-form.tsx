"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordSchema, type ResetPasswordFormData } from "@nimbus/shared";
import { AuthErrorCard } from "@/components/auth/shared/auth-error-card";
import { ArrowLeft, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FieldError } from "@/components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import { useState } from "react";
import Link from "next/link";

export function ResetPasswordForm({ ...props }: ComponentProps<"div">) {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const token = searchParams.get("token");
	const { isLoading, resetPassword } = useResetPassword();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit: SubmitHandler<ResetPasswordFormData> = async data => {
		if (!token) {
			throw new Error("Reset token is missing");
		}
		await resetPassword(data, token);
	};

	if (error === "invalid_token" || !token) {
		return (
			<AuthErrorCard
				title="Invalid Reset Link"
				content="This password reset link is invalid or has expired. Please request a new password reset link to continue."
				actionText="Request New Reset Link"
				actionHref="/forgot-password"
			/>
		);
	}

	return (
		<div className="flex size-full flex-col items-center justify-center gap-0 select-none" {...props}>
			<Card className="w-full max-w-md gap-6 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href="/">
								<ArrowLeft />
								Back
							</Link>
						</Button>
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">Reset Password</CardTitle>
						<CardDescription className="text-center text-xs md:text-sm">Enter your new password below.</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-6">
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password" className="text-sm font-semibold">
									New Password
								</Label>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
								>
									{isPasswordVisible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
							<Input
								id="password"
								type={isPasswordVisible ? "text" : "password"}
								placeholder="Enter your new password"
								className="shadow-md"
								{...register("password")}
								aria-invalid={!!errors.password}
								autoComplete="new-password"
							/>
							<FieldError error={errors.password?.message as string} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="text-sm font-semibold">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type={isPasswordVisible ? "text" : "password"}
								placeholder="Confirm your new password"
								className="shadow-md"
								{...register("confirmPassword")}
								aria-invalid={!!errors.confirmPassword}
								autoComplete="new-password"
							/>
							<FieldError error={errors.confirmPassword?.message as string} />
						</div>

						<Button type="submit" className="mt-2 w-full cursor-pointer" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting password...
								</>
							) : (
								"Reset Password"
							)}
						</Button>
					</form>
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
