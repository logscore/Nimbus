"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthCardProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AuthCard({ title, description, navigationType, children, className, ...props }: AuthCardProps) {
	// const oppositeAction = navigationType === "signin" ? "signup" : "signin";
	// const oppositeActionText = navigationType === "signin" ? "Sign up" : "Sign in";

	return (
		<div className={cn("flex size-full flex-col items-center justify-center gap-0 select-none", className)} {...props}>
			<Card className="w-full max-w-md gap-6 py-0 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-between border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href="/">
								<ArrowLeft />
								Back
							</Link>
						</Button>
						{/* <Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link href={`/${oppositeAction}`}>
								{oppositeActionText}
								<ArrowRight />
							</Link>
						</Button> */}
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">{title}</CardTitle>
						<CardDescription className="text-center text-xs md:text-sm">{description}</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-5">{children}</CardContent>

				<CardFooter className="px-6 py-4">
					<p className="w-full text-center text-sm text-neutral-600">
						By {navigationType === "signin" ? "signing in" : "signing up"}, you agree to our{" "}
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
