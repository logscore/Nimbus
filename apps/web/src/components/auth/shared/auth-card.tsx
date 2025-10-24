import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AuthCardProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function AuthCard({ title, navigationType, children, className, ...props }: AuthCardProps) {
	const oppositeAction = navigationType === "signin" ? "signup" : "signin";
	const oppositeActionText = navigationType === "signin" ? "Sign up" : "Sign in";

	return (
		<div className={cn("flex size-full flex-col items-center justify-center gap-0 select-none", className)} {...props}>
			<Card className="w-full max-w-md gap-6 py-0 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-between border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link to="/">
								<ArrowLeft />
								Back
							</Link>
						</Button>
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link to={`/${oppositeAction}`}>
								{oppositeActionText}
								<ArrowRight />
							</Link>
						</Button>
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">{title}</CardTitle>
					</div>
				</CardHeader>

				<CardContent className="px-5">{children}</CardContent>

				<CardFooter className="px-6 py-4">
					<p className="w-full text-center text-sm text-neutral-600">
						By {navigationType === "signin" ? "signing in" : "signing up"}, you agree to our{" "}
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
