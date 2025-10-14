import { z } from "zod";

// Subscription plan schema
export const subscriptionPlanSchema = z.enum(["free", "pro"]);

// Subscription status schema
export const subscriptionStatusSchema = z.enum([
	"active",
	"canceled",
	"incomplete",
	"incomplete_expired",
	"past_due",
	"paused",
	"trialing",
	"unpaid",
]);

// Create checkout session schema
export const createCheckoutSessionSchema = z.object({
	priceId: z.string().min(1, "Price ID is required"),
	successUrl: z.string().url("Valid success URL is required"),
	cancelUrl: z.string().url("Valid cancel URL is required"),
});

export type CreateCheckoutSessionSchema = z.infer<typeof createCheckoutSessionSchema>;

// Create customer portal schema
export const createCustomerPortalSchema = z.object({
	returnUrl: z.string().url("Valid return URL is required"),
});

export type CreateCustomerPortalSchema = z.infer<typeof createCustomerPortalSchema>;

// Subscription query schema
export const getSubscriptionSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export type GetSubscriptionSchema = z.infer<typeof getSubscriptionSchema>;

// Update subscription schema
export const updateSubscriptionSchema = z.object({
	plan: subscriptionPlanSchema.optional(),
	status: subscriptionStatusSchema.optional(),
	cancelAtPeriodEnd: z.boolean().optional(),
});

export type UpdateSubscriptionSchema = z.infer<typeof updateSubscriptionSchema>;

// Stripe webhook event schema
export const stripeWebhookEventSchema = z.object({
	type: z.string(),
	data: z.object({
		object: z.any(),
	}),
});

export type StripeWebhookEventSchema = z.infer<typeof stripeWebhookEventSchema>;
