// Subscription plan types
export type SubscriptionPlan = "free" | "pro";

export type SubscriptionStatus =
	| "active"
	| "canceled"
	| "incomplete"
	| "incomplete_expired"
	| "past_due"
	| "paused"
	| "trialing"
	| "unpaid";

// Subscription configuration
export interface SubscriptionPlanConfig {
	id: SubscriptionPlan;
	name: string;
	description: string;
	price: number;
	interval: "month" | "year";
	stripePriceId?: string;
	features: string[];
	limits: {
		maxConnections: number | null; // null means unlimited
	};
}

// Subscription record
export interface Subscription {
	id: string;
	plan: SubscriptionPlan;
	referenceId: string; // userId
	stripeCustomerId: string | null;
	stripeSubscriptionId: string | null;
	status: SubscriptionStatus;
	periodStart: Date | null;
	periodEnd: Date | null;
	cancelAtPeriodEnd: boolean;
	seats: number | null;
	trialStart: Date | null;
	trialEnd: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

// Plan configurations
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
	free: {
		id: "free",
		name: "Free",
		description: "Perfect for getting started",
		price: 0,
		interval: "month",
		features: ["1 storage connection", "Basic file management", "Tags and organization"],
		limits: {
			maxConnections: 1,
		},
	},
	pro: {
		id: "pro",
		name: "Pro",
		description: "Unlimited connections for power users",
		price: 30,
		interval: "month",
		stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID,
		features: ["Unlimited storage connections", "All Free features", "Priority support", "Advanced file operations"],
		limits: {
			maxConnections: null, // unlimited
		},
	},
};

// Helper to get plan limits
export function getPlanLimits(plan: SubscriptionPlan): SubscriptionPlanConfig["limits"] {
	return SUBSCRIPTION_PLANS[plan].limits;
}

// Helper to check if user can add more connections
export function canAddConnection(plan: SubscriptionPlan, currentConnectionCount: number): boolean {
	const limits = getPlanLimits(plan);
	if (limits.maxConnections === null) {
		return true; // unlimited
	}
	return currentConnectionCount < limits.maxConnections;
}

// Stripe checkout session request
export interface CreateCheckoutSessionRequest {
	priceId: string;
	successUrl: string;
	cancelUrl: string;
}

// Stripe checkout session response
export interface CreateCheckoutSessionResponse {
	sessionId: string;
	url: string;
}

// Stripe customer portal request
export interface CreateCustomerPortalRequest {
	returnUrl: string;
}

// Stripe customer portal response
export interface CreateCustomerPortalResponse {
	url: string;
}

// Webhook event types
export type StripeWebhookEvent =
	| "checkout.session.completed"
	| "customer.subscription.created"
	| "customer.subscription.updated"
	| "customer.subscription.deleted"
	| "invoice.payment_succeeded"
	| "invoice.payment_failed";
