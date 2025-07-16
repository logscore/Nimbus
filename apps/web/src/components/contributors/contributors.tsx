import { GitFork, Star, Users, GitPullRequest, Loader2, AlertCircle } from "lucide-react";
import { ContributorFooter } from "@/components/contributors/footer";
import type { Contributor } from "@/components/contributors/card";
import { ContributorCard } from "@/components/contributors/card";
import { ActivityChart } from "@/components/contributors/chart";
import { StatCard } from "@/components/contributors/stats";
import useContributors from "@/hooks/useContributors";
import { Badge } from "@/components/ui/badge";

export default function Contributors() {
	const {
		contributorsLoading,
		repoLoading,
		prLoading,
		activityLoading,
		contributorsError,
		repoError,
		prError,
		activityError,
		contributors,
		repoStats,
		prCount,
		activityData,
	} = useContributors();

	if (contributorsLoading || repoLoading || prLoading || activityLoading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center space-y-4">
				<Loader2 className="animate-spin" />
				<h1 className="text-xl font-bold">Loading Data</h1>
			</div>
		);
	}

	if (contributorsError || repoError || prError || activityError) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center space-y-4">
				<AlertCircle className="text-red-500" />
				<h1 className="text-xl font-bold">Error occurred</h1>
			</div>
		);
	}
	const sortedContributors = [...(contributors as Contributor[])].sort((a, b) => b.contributions - a.contributions);
	const totalContributions = sortedContributors.reduce((sum, c) => sum + c.contributions, 0);

	return (
		<div className="bg-background min-h-screen w-full pt-20">
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<div className="space-y-8">
					<div className="space-y-4 text-center">
						<h1 className="pt-10 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
							<span className="from-primary via-primary/80 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
								Our Contributors
							</span>
						</h1>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
							Meet the incredible developers who make {repoStats?.name || "Nimbus"} possible
						</p>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<StatCard
							title="Stars"
							value={repoStats?.stargazers_count || 0}
							description="Community love"
							icon={Star}
							color="text-yellow-500"
							gradient="from-yellow-500/10 to-orange-500/20"
						/>
						<StatCard
							title="Forks"
							value={repoStats?.forks_count || 0}
							description="Active forks"
							icon={GitFork}
							color="text-blue-500"
							gradient="from-blue-500/10 to-cyan-500/20"
						/>
						<StatCard
							title="Contributors"
							value={sortedContributors?.length || 0}
							description="Amazing devs"
							icon={Users}
							color="text-green-500"
							gradient="from-green-500/10 to-emerald-500/20"
						/>
						<StatCard
							title="Pull Requests"
							value={prCount || 0}
							description="Total PRs"
							icon={GitPullRequest}
							color="text-purple-500"
							gradient="from-purple-500/10 to-pink-500/20"
						/>
					</div>

					<div className="mx-auto w-full max-w-3xl">
						<ActivityChart data={activityData || []} />
					</div>

					<div className="space-y-6">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<h2 className="text-2xl font-bold">All Contributors</h2>
								<p className="text-muted-foreground text-base">
									{totalContributions.toLocaleString()} total contributions from {sortedContributors.length} amazing
									developers
								</p>
							</div>
							<Badge variant="secondary" className="w-fit rounded-sm border-dashed">
								{sortedContributors.length} contributors
							</Badge>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{sortedContributors.map(contributor => (
								<ContributorCard key={contributor.id} contributor={contributor} />
							))}
						</div>
					</div>

					<ContributorFooter
						repoName={repoStats?.name || "Nimbus"}
						repoUrl={repoStats?.html_url}
						createdAt={repoStats?.created_at || ""}
					/>
				</div>
			</div>
		</div>
	);
}
