"use client";

import { SocialAuthButton } from "@/components/auth/shared/social-auth-button";
import { PasswordInput } from "@/components/auth/shared/password-input";
import { AuthCard } from "@/components/auth/shared/auth-card";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signInSchema, type SignInFormData } from "@/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import type { ComponentProps, ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function SigninForm({ className, ...props }: ComponentProps<"div">) {
	const { isLoading, signInWithCredentials, signInWithGoogleProvider, signInWithMicrosoftProvider } = useSignIn();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
			remember: false,
		},
	});

	const passwordValue = watch("password");

	const onSubmit: SubmitHandler<SignInFormData> = async data => {
		await signInWithCredentials(data);
	};

	return (
		<AuthCard
			title="Welcome back to Nimbus.storage"
			description="You do the files, we store them."
			navigationType="signin"
			className={className}
			{...props}
		>
			<div className="flex flex-col gap-4">
				<SocialAuthButton
					provider="google"
					action="signin"
					onClick={signInWithGoogleProvider}
					disabled={isLoading}
				/>
				<SocialAuthButton
					provider="microsoft"
					action="signin"
					onClick={signInWithMicrosoftProvider}
					disabled={isLoading}
				/>

				<div className="text-center text-muted-foreground text-sm font-semibold font-mono tracking-wider">OR</div>

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="space-y-1">
						<Label htmlFor="email" className="dark:text-muted-foreground text-sm font-semibold">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="example@0.email"
							className=""
							{...register("email")}
							aria-invalid={!!errors.email}
							autoComplete="email"
						/>
						<FieldError error={errors.email?.message} />
					</div>

					<div className="space-y-1">
						<Label htmlFor="password" className="dark:text-muted-foreground text-sm font-semibold">
							Password
						</Label>
						<PasswordInput
							id="password"
							value={passwordValue}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setValue("password", e.target.value)}
							placeholder="Enter your password"
							autoComplete="current-password"
							aria-invalid={!!errors.password}
						/>
						<FieldError error={errors.password?.message} />
					</div>

					<div className="flex items-center justify-between mt-1">
						<div className="flex flex-1 items-center space-x-2">
							<Checkbox
								id="remember"
								{...register("remember")}
								onCheckedChange={checked => setValue("remember", !!checked)}
								defaultChecked={true}
							/>
							<Label htmlFor="remember" className="text-muted-foreground cursor-pointer text-sm overflow-hidden line-clamp-1">
								Remember me
							</Label>
						</div>
						<Link
							href="/forgot-password"
							className="text-muted-foreground hover:text-primary text-sm underline underline-offset-4 transition-colors"
						>
							Forgot password?
						</Link>
					</div>

					<Button type="submit" className="mt-2 w-full cursor-pointer" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>
			</div>
		</AuthCard>
	);
}
