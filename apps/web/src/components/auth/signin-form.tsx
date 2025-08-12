"use client";

import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
// import { PasswordInput } from "@/components/auth/shared/password-input";
// import { signInSchema, type SignInFormData } from "@nimbus/shared";
import { AuthCard } from "@/components/auth/shared/auth-card";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
import { useSignIn } from "@/hooks/useAuth";
// import { useForm, type SubmitHandler } from "react-hook-form";
// import { FieldError } from "@/components/ui/field-error";
import type { ComponentProps } from "react";
// import { Loader2 } from "lucide-react";
// import Link from "next/link";

export function SignInForm({ className, ...props }: ComponentProps<"div">) {
	const { isLoading } = useSignIn();

	// const {
	// 	register,
	// 	handleSubmit,
	// 	formState: { errors },
	// 	setValue,
	// 	watch,
	// } = useForm<SignInFormData>({
	// 	resolver: zodResolver(signInSchema),
	// 	defaultValues: {
	// 		email: "",
	// 		password: "",
	// 		remember: false,
	// 	},
	// });

	// const passwordValue = watch("password");

	// const onSubmit: SubmitHandler<SignInFormData> = async data => {
	// 	await signInWithCredentials(data);
	// };

	return (
		<AuthCard
			title="Welcome back to Nimbus.storage"
			description="You do the files, we store them."
			navigationType="signin"
			className={className}
			{...props}
		>
			<div className="flex flex-col gap-4">
				<AuthProviderButtons action="signin" isLoading={isLoading} />
				{/* 
				<div className="text-muted-foreground text-center font-mono text-sm font-semibold tracking-wider">OR</div>

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

					<div className="mt-1 flex items-center justify-between">
						<div className="flex flex-1 items-center space-x-2">
							<Checkbox
								id="remember"
								{...register("remember")}
								onCheckedChange={checked => setValue("remember", !!checked)}
								defaultChecked={true}
							/>
							<Label
								htmlFor="remember"
								className="text-muted-foreground line-clamp-1 cursor-pointer overflow-hidden text-sm"
							>
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
				</form> */}
			</div>
		</AuthCard>
	);
}
