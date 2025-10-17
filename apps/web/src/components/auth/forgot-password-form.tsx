import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@nimbus/shared";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FieldError } from "@/components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";

export function ForgotPasswordForm({ ...props }: ComponentProps<"div">) {
	const { mutate, isPending } = useForgotPassword();

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
		mutate(data);
	};

	return (
		<div className="flex size-full flex-col items-center justify-center gap-0 select-none" {...props}>
			<Card className="w-full max-w-md gap-6 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<a href="/signin">
								<ArrowLeft />
								Back
							</a>
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

						<Button type="submit" className="mt-2 w-full cursor-pointer" disabled={isPending}>
							{isPending ? (
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
						<Link to="/terms" className="cursor-pointer whitespace-nowrap underline underline-offset-4">
							terms of service
						</Link>
						.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
