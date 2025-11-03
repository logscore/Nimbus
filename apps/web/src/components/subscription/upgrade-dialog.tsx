import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeDialog() {
	return (
		<Dialog>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					{/* DialogTitle is required for accessibility */}
					<DialogTitle className="text-2xl font-bold">Upgrade to Pro</DialogTitle>

					<DialogDescription className="text-gray-600 dark:text-gray-400">
						You’ve hit the free plan limit. Unlock full power with Nimbus Pro.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Status */}
					<Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
						<CardContent className="pt-5">
							<div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
								<XCircle className="h-5 w-5 shrink-0" />
								<p className="font-medium">Connection limit reached — time to scale up!</p>
							</div>
						</CardContent>
					</Card>

					{/* Pro Plan */}
					<div>
						<div className="flex items-baseline justify-between pb-3">
							<div>
								<h3 className="text-xl font-semibold">Nimbus Pro</h3>
								<p className="text-muted-foreground text-sm">Designed for professionals who outgrow free.</p>
							</div>
							<div className="text-right">
								<div className="flex items-baseline gap-1">
									<span className="text-3xl font-bold">$25</span>
									<span className="text-muted-foreground text-sm">/mo</span>
								</div>
							</div>
						</div>

						<Card>
							<CardContent className="pt-5">
								<ul className="space-y-3">
									{[
										"Unlimited connections",
										"1 TB secure storage",
										"AI-powered search & insights",
										"Priority support",
									].map(feature => (
										<li key={feature} className="flex items-start gap-3">
											<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</div>

					{/* CTA */}
					<div className="flex gap-3 pt-2">
						<Button variant="ghost" className="flex-1">
							Not Now
						</Button>
						<Button className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700">Upgrade Now — $25/mo</Button>
					</div>

					<p className="text-muted-foreground text-center text-xs">Secure checkout powered by Polar · Cancel anytime</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
