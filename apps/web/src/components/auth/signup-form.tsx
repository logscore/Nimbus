"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { signUpSchema, type SignUpFormData } from "@nimbus/shared";
import { ArrowLeft, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useCheckEmailExists, useSignUp } from "@/hooks/useAuth";
import { FieldError } from "@/components/ui/field-error";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export function SignupForm({ className, ...props }: ComponentProps<"div">) {
	const searchParams = useSearchParams();
	const urlEmail = searchParams.get("email");
	const [showPasswordEntry, setShowPasswordEntry] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const { isLoading, signUpWithCredentials } = useSignUp();
	const checkEmailMutation = useCheckEmailExists();

	const {
		register,
		handleSubmit,
		formState: { errors },
		trigger,
		getValues,
		setError,
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: urlEmail ?? "",
			firstName: "",
			lastName: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleContinue = async () => {
		const isValid = await trigger(["firstName", "lastName", "email"]);
		if (isValid) {
			const email = getValues("email");

			checkEmailMutation.mutate(email, {
				onSuccess: data => {
					if (data.exists) {
						setError("email", {
							type: "manual",
							message: "An account with this email already exists. Please sign in instead.",
						});
						toast.error("An account with this email already exists. Please sign in instead.");
					} else {
						setShowPasswordEntry(true);
					}
				},
				onError: () => {
					toast.error("Failed to verify email. Please try again.");
				},
			});
		}
	};

	// const handleGoBack = () => {
	// 	setShowPasswordEntry(false);
	// };

	const onSubmit = async (data: SignUpFormData) => {
		await signUpWithCredentials(data);
	};

	return (
		<div className={cn("flex size-full flex-col items-center justify-center gap-0 select-none", className)} {...props}>
			<Card className="w-full max-w-md gap-6 py-0 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href={`/signin`}>
								<ArrowLeft className="mr-2" />
								Sign in
							</Link>
						</Button>
					</div>
					<SegmentedProgress segments={2} value={showPasswordEntry ? 2 : 1} />
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">Sign up for Nimbus.storage</CardTitle>
						<CardDescription className="text-center text-xs md:text-sm">
							{!showPasswordEntry ? "Let's create your Nimbus storage account" : "Let's secure your account"}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-6">
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
						{!showPasswordEntry && (
							<>
								<AuthProviderButtons action="signup" isLoading={isLoading} />
								<div className="text-muted-foreground text-center font-mono text-sm font-semibold tracking-wider">
									OR
								</div>
							</>
						)}

						<div className="grid grid-cols-2 gap-1.5 align-top">
							<div className="space-y-1">
								<Label htmlFor="firstName" className="dark:text-muted-foreground text-sm font-semibold">
									First name
								</Label>
								<Input
									id="firstName"
									placeholder="John"
									className="rounded-r-sm"
									{...register("firstName")}
									aria-invalid={!!errors.firstName}
								/>
								<FieldError error={errors.firstName?.message as string} />
							</div>
							<div className="space-y-1">
								<Label htmlFor="lastName" className="dark:text-muted-foreground text-sm font-semibold">
									Last name
								</Label>
								<Input
									id="lastName"
									placeholder="Doe"
									className="rounded-l-sm"
									{...register("lastName")}
									aria-invalid={!!errors.lastName}
								/>
								<FieldError error={errors.lastName?.message as string} />
							</div>
						</div>

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
							/>
							<FieldError error={errors.email?.message as string} />
						</div>

						{!showPasswordEntry && (
							<Button
								type="button"
								className="w-full cursor-pointer font-semibold"
								onClick={handleContinue}
								disabled={isLoading || checkEmailMutation.isPending}
							>
								{checkEmailMutation.isPending ? (
									<>
										<Loader2 className="mr-2 animate-spin" />
										Checking email...
									</>
								) : isLoading ? (
									<Loader2 className="animate-spin" />
								) : (
									"Continue"
								)}
							</Button>
						)}

						{showPasswordEntry && (
							<div className="flex flex-col gap-4">
								<Separator />
								<div className="space-y-1">
									<div className="flex flex-row items-end-safe justify-between">
										<Label htmlFor="password" className="dark:text-muted-foreground text-sm font-semibold">
											Password
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
										placeholder="Enter your password"
										{...register("password")}
										aria-invalid={!!errors.password}
									/>
									<FieldError error={errors.password?.message as string} />
								</div>

								<div className="space-y-1">
									<Label htmlFor="confirmPassword" className="dark:text-muted-foreground text-sm font-semibold">
										Confirm Password
									</Label>
									<Input
										id="confirmPassword"
										type={isPasswordVisible ? "text" : "password"}
										placeholder="Confirm your password"
										{...register("confirmPassword")}
										aria-invalid={!!errors.confirmPassword}
									/>
									<FieldError error={errors.confirmPassword?.message as string} />
								</div>

								<Button type="submit" className="flex-1" disabled={isLoading}>
									{isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
								</Button>
							</div>
						)}
					</form>
				</CardContent>
				<CardFooter className="px-6 py-4">
					<p className="w-full text-center text-sm text-neutral-600">
						By signing up, you agree to our{" "}
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
