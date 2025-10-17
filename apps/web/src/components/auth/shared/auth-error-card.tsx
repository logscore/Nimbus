import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface AuthErrorCardProps {
	title: string;
	content: string;
	actionText: string;
	actionHref: string;
	className?: string;
}

export function AuthErrorCard({ title, content, actionText, actionHref, className, ...props }: AuthErrorCardProps) {
	return (
		<div className="flex size-full flex-col items-center justify-center gap-0 select-none" {...props}>
			<Card className={`w-full max-w-md gap-6 py-0 pb-0 ${className}`}>
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-start border-b">
						<Button className="cursor-pointer rounded-none px-6 py-6 font-semibold" variant="link" asChild>
							<Link to="/">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Home
							</Link>
						</Button>
					</div>
					<div className="gap-2 pt-6">
						<CardTitle className="text-center text-lg md:text-xl">{title}</CardTitle>
					</div>
				</CardHeader>

				<CardContent className="px-6">
					<p className="text-muted-foreground text-center">{content}</p>
				</CardContent>

				<CardFooter className="px-6 py-4">
					<Button asChild className="w-full">
						<Link to={actionHref}>{actionText}</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
