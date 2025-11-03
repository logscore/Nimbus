import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { authClient } from "@nimbus/auth/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

async function upgradePlan() {
	const response = await authClient.checkout({ slug: "pro" });
	if (response.error) {
		toast.error(response.error.message);
	}
}

export function SubscriptionInfo() {
	const { data: subscriptions } = useQuery({
		queryKey: ["subscriptions"],
		queryFn: async () => {
			const response = await authClient.customer.subscriptions.list({
				query: { page: 1, limit: 10, active: true },
			});
			return response.data;
		},
	});

	const planId = subscriptions?.result.items[0]?.id;
	const isPro = Boolean(planId);

	return (
		<Card className="border-muted/30 max-w-full border shadow-sm">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Subscription</CardTitle>
						<CardDescription>Manage your subscription and billing</CardDescription>
					</div>
					<Badge variant={isPro ? "default" : "secondary"} className="ml-auto capitalize">
						{isPro ? "Pro" : "Free"}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Plan Summary */}
				<div className="space-y-2">
					<h3 className="text-base font-medium">{isPro ? "Pro Plan" : "Free Plan"}</h3>
					<p className="text-muted-foreground text-sm">
						{isPro
							? "You’re enjoying premium access with all features enabled."
							: "Upgrade to unlock advanced features and full control."}
					</p>
				</div>

				{/* Features List */}
				{!isPro && (
					<ul className="space-y-2 pl-1">
						{["1 TB of secure encrypted storage", "AI-powered file search", "Unlimited provider connections"].map(
							feature => (
								<li key={feature} className="text-muted-foreground flex items-start gap-2 text-sm">
									<CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
									{feature}
								</li>
							)
						)}
					</ul>
				)}

				{/* Action Button */}
				<div className="flex w-full justify-center pt-2">
					{isPro ? (
						<Button variant="outline" className="w-3/4 transition-transform hover:scale-99 active:scale-97">
							<CreditCard className="mr-2 h-4 w-4" />
							Manage Subscription
						</Button>
					) : (
						<Button
							onClick={upgradePlan}
							className="h-12 w-3/4 text-lg shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-transform duration-300 hover:scale-99 hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] active:scale-97"
							variant={"outline"}
						>
							<Zap className="mr-2 h-4 w-4 text-yellow-300" />
							Upgrade to Pro – $25/month
						</Button>
					)}
				</div>

				{/* Footer Text */}
				<p className="text-muted-foreground text-center text-xs">
					{isPro
						? "Manage billing and invoices in the Polar customer portal."
						: "Secure payment powered by Polar. Cancel anytime."}
				</p>
			</CardContent>
		</Card>
	);
}
