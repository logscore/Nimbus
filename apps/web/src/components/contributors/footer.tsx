import { Card, CardContent } from "@/components/ui/card";
import { Star, GitFork, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ContributorFooter({
	repoName,
	repoUrl,
	createdAt,
}: {
	repoName: string;
	repoUrl: string;
	createdAt: string;
}) {
	return (
		<Card className="bg-muted/30 rounded-sm border-dashed">
			<CardContent className="flex flex-col items-center space-y-4 py-8 text-center">
				<div className="space-y-2">
					<h3 className="text-xl font-semibold">Join Our Community</h3>
					<p className="text-muted-foreground max-w-md">
						Help us build {repoName} and become part of our amazing contributor community!
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-4 text-sm">
					<Link
						to={repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
					>
						<Star className="h-4 w-4" />
						Star on GitHub
					</Link>
					<span className="text-muted-foreground">•</span>
					<Link
						to={repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
					>
						<GitFork className="h-4 w-4" />
						Fork Repository
					</Link>
					{createdAt && (
						<>
							<span className="text-muted-foreground">•</span>
							<div className="text-muted-foreground flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Since {new Date(createdAt).getFullYear()}
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
