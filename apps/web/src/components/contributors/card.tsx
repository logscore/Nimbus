import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { GitCommit } from "lucide-react";

export interface Contributor {
	login: string;
	id: number;
	avatar_url: string;
	contributions: number;
	html_url: string;
	type: string;
	site_admin: boolean;
}

export function ContributorCard({ contributor }: { contributor: Contributor }) {
	return (
		<Link to={contributor.html_url} target="_blank" rel="noopener noreferrer" className="block max-w-full">
			<Card className="group flex aspect-square w-full flex-col rounded-sm border-dashed p-3 transition-all duration-200 hover:cursor-pointer hover:border-solid hover:shadow-md">
				<div className="flex flex-1 flex-col items-center justify-center space-y-2 text-center">
					<Avatar className="h-12 w-12 rounded-lg border-0 sm:h-14 sm:w-14 md:h-16 md:w-16">
						<AvatarImage src={contributor.avatar_url} alt={contributor.login} />
						<AvatarFallback className="rounded-lg text-xs font-medium sm:text-sm">
							{contributor.login.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="flex min-h-[2rem] w-full items-center justify-center">
						<CardTitle className="hover:text-primary truncate text-center text-xs leading-tight font-medium transition-colors sm:text-sm">
							{contributor.login}
						</CardTitle>
					</div>
				</div>

				<div className="border-border/50 mt-auto flex items-center justify-center space-x-1 border-t pt-2">
					<GitCommit className="text-muted-foreground h-3 w-3" />
					<span className="text-xs font-medium">{contributor.contributions}</span>
					{contributor.site_admin && (
						<Badge variant="outline" className="ml-1 rounded-sm border-dashed text-xs">
							Admin
						</Badge>
					)}
				</div>
			</Card>
		</Link>
	);
}
