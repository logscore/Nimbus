"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FieldError } from "@/components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/useAuth";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import Link from "next/link";

export function ForgotPasswordForm({ ...props }: ComponentProps<"div">) {
	const { isLoading, sendResetEmail } = useForgotPassword();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit: SubmitHandler<ForgotPasswordFormData> = async data => {
		await sendResetEmail(data);
	};

	return (
		<div className="flex size-full flex-col items-center justify-center gap-0 select-none" {...props}>
			<Card className="w-full max-w-md gap-6 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href="/signin">
								<ArrowLeft />
								Back
							</Link>
						</Button>
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">Reset your password</CardTitle>
						<CardDescription className="text-center text-xs md:text-sm">
							Enter your email to receive a password reset link.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-6">
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-semibold">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="example@0.email"
								className="shadow-md"
								{...register("email")}
								aria-invalid={!!errors.email}
								autoComplete="email"
							/>
							<FieldError error={errors.email?.message} />
						</div>

						<Button type="submit" className="mt-2 w-full cursor-pointer" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending reset link...
								</>
							) : (
								"Send Reset Link"
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
