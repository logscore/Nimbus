"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@nimbus/shared";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import env from "@nimbus/env/client";
import { useState } from "react";
import { toast } from "sonner";

interface UpgradeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPlan: SubscriptionPlan;
	currentConnectionCount: number;
	maxConnections: number | null;
}

export function UpgradeDialog({
	open,
	onOpenChange,
	currentPlan,
	currentConnectionCount,
	maxConnections,
}: UpgradeDialogProps) {
	const [isUpgrading, setIsUpgrading] = useState(false);
	const proPlan = SUBSCRIPTION_PLANS.pro;

	const handleUpgrade = async () => {
		try {
			setIsUpgrading(true);

			// Create checkout session
			const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/subscription/checkout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					priceId: env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
					successUrl: `${env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/settings?upgrade=success`,
					cancelUrl: `${env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/settings?upgrade=canceled`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create checkout session");
			}

			const data = await response.json();

			// Redirect to Stripe Checkout
			if (data.data?.url) {
				window.location.href = data.data.url;
			} else {
				throw new Error("No checkout URL returned");
			}
		} catch (error) {
			console.error("Error upgrading:", error);
			toast.error("Failed to start upgrade process. Please try again.");
			setIsUpgrading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Upgrade to Pro</DialogTitle>
					<DialogDescription>
						{maxConnections !== null
							? `You've reached the maximum of ${maxConnections} connection${maxConnections === 1 ? "" : "s"} on the ${currentPlan} plan.`
							: "Unlock unlimited storage connections and premium features."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Status */}
					<Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
						<CardContent className="pt-6">
							<div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
								<XCircle className="h-5 w-5" />
								<div>
									<p className="font-medium">Connection Limit Reached</p>
									<p className="text-sm text-orange-700 dark:text-orange-300">
										You have {currentConnectionCount} of {maxConnections} connection
										{maxConnections === 1 ? "" : "s"} connected
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Pro Plan Features */}
					<div className="space-y-4">
						<div className="flex items-baseline justify-between">
							<div>
								<h3 className="text-xl font-bold">{proPlan.name} Plan</h3>
								<p className="text-muted-foreground text-sm">{proPlan.description}</p>
							</div>
							<div className="text-right">
								<div className="flex items-baseline gap-1">
									<span className="text-3xl font-bold">${proPlan.price}</span>
									<span className="text-muted-foreground text-sm">/{proPlan.interval}</span>
								</div>
							</div>
						</div>

						<Card>
							<CardContent className="pt-6">
								<ul className="space-y-3">
									{proPlan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-3">
											<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpgrading} className="flex-1">
							Maybe Later
						</Button>
						<Button onClick={handleUpgrade} disabled={isUpgrading} className="flex-1">
							{isUpgrading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Redirecting...
								</>
							) : (
								`Upgrade to Pro - $${proPlan.price}/${proPlan.interval}`
							)}
						</Button>
					</div>

					<p className="text-muted-foreground text-center text-xs">Secure payment powered by Stripe. Cancel anytime.</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
