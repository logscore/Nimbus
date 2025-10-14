"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS, type Subscription } from "@nimbus/shared";
import { CheckCircle2, CreditCard, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import env from "@nimbus/env/client";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionInfoProps {
	subscription: Subscription;
	connectionCount: number;
	maxConnections: number | null;
	canAddConnection: boolean;
	isActive: boolean;
	onUpgradeClick?: () => void;
}

export function SubscriptionInfo({
	subscription,
	connectionCount,
	maxConnections,
	canAddConnection,
	isActive,
	onUpgradeClick,
}: SubscriptionInfoProps) {
	const [isLoadingPortal, setIsLoadingPortal] = useState(false);
	const currentPlan = SUBSCRIPTION_PLANS[subscription.plan];
	const isPro = subscription.plan === "pro";

	const handleManageSubscription = async () => {
		try {
			setIsLoadingPortal(true);

			const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/subscription/portal`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					returnUrl: `${env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/settings`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create portal session");
			}

			const data = await response.json();

			if (data.data?.url) {
				window.location.href = data.data.url;
			} else {
				throw new Error("No portal URL returned");
			}
		} catch (error) {
			console.error("Error opening customer portal:", error);
			toast.error("Failed to open billing portal. Please try again.");
			setIsLoadingPortal(false);
		}
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Subscription</CardTitle>
						<CardDescription>Manage your subscription and billing</CardDescription>
					</div>
					<Badge variant={isPro ? "default" : "secondary"} className="ml-auto">
						{currentPlan.name}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Plan Details */}
				<div className="space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<h4 className="font-semibold">{currentPlan.name} Plan</h4>
							<p className="text-muted-foreground text-sm">{currentPlan.description}</p>
						</div>
						{isPro && (
							<div className="text-right">
								<p className="text-2xl font-bold">${currentPlan.price}</p>
								<p className="text-muted-foreground text-xs">per {currentPlan.interval}</p>
							</div>
						)}
					</div>

					{/* Connection Usage */}
					<div className="rounded-lg border p-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm font-medium">Storage Connections</span>
							<span className="text-muted-foreground text-sm">
								{connectionCount} / {maxConnections === null ? "Unlimited" : maxConnections}
							</span>
						</div>
						<div className="bg-secondary h-2 overflow-hidden rounded-full">
							<div
								className={`h-full transition-all ${
									!canAddConnection ? "bg-orange-500" : isPro ? "bg-green-500" : "bg-blue-500"
								}`}
								style={{
									width:
										maxConnections === null ? "100%" : `${Math.min((connectionCount / maxConnections) * 100, 100)}%`,
								}}
							/>
						</div>
						{!canAddConnection && (
							<p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
								You&apos;ve reached your connection limit. Upgrade to Pro for unlimited connections.
							</p>
						)}
					</div>

					{/* Plan Features */}
					<div className="space-y-2">
						<h5 className="text-sm font-medium">Plan Features</h5>
						<ul className="space-y-2">
							{currentPlan.features.map((feature: string, index: number) => (
								<li key={index} className="flex items-start gap-2 text-sm">
									<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
									<span className="text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Billing Information (Pro only) */}
					{isPro && subscription.periodEnd && (
						<div className="rounded-lg border p-4">
							<div className="mb-2 flex items-center gap-2">
								<CreditCard className="h-4 w-4" />
								<span className="text-sm font-medium">Billing Information</span>
							</div>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Status:</span>
									<Badge variant={isActive ? "default" : "secondary"} className="text-xs">
										{subscription.status}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Current period ends:</span>
									<span>{formatDate(subscription.periodEnd)}</span>
								</div>
								{subscription.cancelAtPeriodEnd && (
									<div className="mt-2 rounded bg-orange-50 p-2 text-xs text-orange-800 dark:bg-orange-950/20 dark:text-orange-200">
										Your subscription will be canceled at the end of the current billing period.
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3">
					{!isPro ? (
						<Button onClick={onUpgradeClick} className="w-full">
							<Zap className="mr-2 h-4 w-4" />
							Upgrade to Pro - ${SUBSCRIPTION_PLANS.pro.price}/{SUBSCRIPTION_PLANS.pro.interval}
						</Button>
					) : (
						<Button variant="outline" onClick={handleManageSubscription} disabled={isLoadingPortal} className="w-full">
							{isLoadingPortal ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Loading...
								</>
							) : (
								<>
									<CreditCard className="mr-2 h-4 w-4" />
									Manage Subscription
								</>
							)}
						</Button>
					)}
				</div>

				<p className="text-muted-foreground text-center text-xs">
					{isPro
						? "Manage your billing, payment methods, and download invoices in the customer portal."
						: "Secure payment powered by Stripe. Cancel anytime."}
				</p>
			</CardContent>
		</Card>
	);
}
