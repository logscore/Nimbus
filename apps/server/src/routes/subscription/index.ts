import {
	createCheckoutSessionSchema,
	createCustomerPortalSchema,
	type CreateCheckoutSessionSchema,
	type CreateCustomerPortalSchema,
	SUBSCRIPTION_PLANS,
} from "@nimbus/shared";
import { SubscriptionService } from "../../services/subscription-service";
import { sendError, sendSuccess, sendUnauthorized } from "../utils";
import { createRateLimiter } from "@nimbus/cache/rate-limiters";
import { securityMiddleware } from "../../middleware";
import { zValidator } from "@hono/zod-validator";
import { type HonoContext } from "../../hono";
import { cacheClient } from "@nimbus/cache";
import { env } from "@nimbus/env/server";
import Stripe from "stripe";
import { Hono } from "hono";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-08-27.basil",
});

const subscriptionRouter = new Hono<HonoContext>()
	// Get user's subscription info
	.get(
		"/",
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-subscription-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}

			try {
				const subscriptionService = new SubscriptionService(c.var.db);
				const stats = await subscriptionService.getSubscriptionStats(user.id);

				return sendSuccess(c, {
					data: {
						subscription: stats.subscription,
						connectionCount: stats.connectionCount,
						maxConnections: stats.maxConnections,
						canAddConnection: stats.canAddConnection,
						isActive: stats.isActive,
					},
				});
			} catch (error) {
				console.error("Error fetching subscription:", error);
				return sendError(c, { message: "Failed to fetch subscription", status: 500 });
			}
		}
	)

	// Create Stripe checkout session
	.post(
		"/checkout",
		zValidator("json", createCheckoutSessionSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 10,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `post-checkout-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}

			const data: CreateCheckoutSessionSchema = c.req.valid("json");

			try {
				// Get or create subscription to access stripe customer ID
				const subscriptionService = new SubscriptionService(c.var.db);
				const subscription = await subscriptionService.getOrCreateSubscription(user.id);

				// Create Stripe checkout session
				const session = await stripe.checkout.sessions.create({
					customer: subscription.stripeCustomerId || undefined,
					customer_email: !subscription.stripeCustomerId ? user.email : undefined,
					line_items: [
						{
							price: data.priceId,
							quantity: 1,
						},
					],
					mode: "subscription",
					success_url: data.successUrl,
					cancel_url: data.cancelUrl,
					metadata: {
						userId: user.id,
					},
					subscription_data: {
						metadata: {
							userId: user.id,
						},
					},
				});

				return sendSuccess(c, {
					data: {
						sessionId: session.id,
						url: session.url,
					},
				});
			} catch (error) {
				console.error("Error creating checkout session:", error);
				return sendError(c, { message: "Failed to create checkout session", status: 500 });
			}
		}
	)

	// Create Stripe customer portal session
	.post(
		"/portal",
		zValidator("json", createCustomerPortalSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 10,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `post-portal-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}

			const data: CreateCustomerPortalSchema = c.req.valid("json");

			try {
				const subscriptionService = new SubscriptionService(c.var.db);
				const subscription = await subscriptionService.getOrCreateSubscription(user.id);

				if (!subscription.stripeCustomerId) {
					return sendError(c, { message: "No Stripe customer found", status: 400 });
				}

				// Create Stripe customer portal session
				const session = await stripe.billingPortal.sessions.create({
					customer: subscription.stripeCustomerId,
					return_url: data.returnUrl,
				});

				return sendSuccess(c, {
					data: {
						url: session.url,
					},
				});
			} catch (error) {
				console.error("Error creating portal session:", error);
				return sendError(c, { message: "Failed to create portal session", status: 500 });
			}
		}
	)

	// Stripe webhook endpoint
	.post("/webhook", async c => {
		const signature = c.req.header("stripe-signature");

		if (!signature) {
			return sendError(c, { message: "Missing stripe-signature header", status: 400 });
		}

		let event: Stripe.Event;

		try {
			const body = await c.req.text();
			event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return sendError(c, { message: "Webhook signature verification failed", status: 400 });
		}

		const subscriptionService = new SubscriptionService(c.var.db);

		try {
			switch (event.type) {
				case "checkout.session.completed": {
					const session = event.data.object as Stripe.Checkout.Session;
					const userId = session.metadata?.userId;

					if (!userId) {
						console.error("No userId in checkout session metadata");
						break;
					}

					// Update subscription with Stripe customer ID
					if (session.customer && typeof session.customer === "string") {
						await subscriptionService.updateSubscription(userId, {
							stripeCustomerId: session.customer,
						});
					}

					break;
				}

				case "customer.subscription.created":
				case "customer.subscription.updated": {
					const subscription = event.data.object as Stripe.Subscription;
					const userId = subscription.metadata?.userId;

					if (!userId) {
						console.error("No userId in subscription metadata");
						break;
					}

					// Determine plan from price ID
					const priceId = subscription.items.data[0]?.price.id;
					const plan = priceId === env.STRIPE_PRO_PRICE_ID ? "pro" : "free";

					const stripeSubscription = subscription as any;
					await subscriptionService.updateSubscription(userId, {
						plan,
						status: subscription.status as any,
						stripeSubscriptionId: subscription.id,
						stripeCustomerId:
							typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
						periodStart: new Date(stripeSubscription.current_period_start * 1000),
						periodEnd: new Date(stripeSubscription.current_period_end * 1000),
						cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
					});

					break;
				}

				case "customer.subscription.deleted": {
					const subscription = event.data.object as Stripe.Subscription;
					const userId = subscription.metadata?.userId;

					if (!userId) {
						console.error("No userId in subscription metadata");
						break;
					}

					// Downgrade to free plan
					await subscriptionService.downgradeToFree(userId);

					break;
				}

				case "invoice.payment_succeeded": {
					const invoice = event.data.object as Stripe.Invoice;
					const subscriptionId = (invoice as any).subscription;

					if (subscriptionId && typeof subscriptionId === "string") {
						// Fetch subscription to get metadata
						const subscription = await stripe.subscriptions.retrieve(subscriptionId);
						const userId = subscription.metadata?.userId;

						if (userId) {
							// Ensure subscription is active
							await subscriptionService.updateSubscription(userId, {
								status: "active",
							});
						}
					}

					break;
				}

				case "invoice.payment_failed": {
					const invoice = event.data.object as Stripe.Invoice;
					const subscriptionId = (invoice as any).subscription;

					if (subscriptionId && typeof subscriptionId === "string") {
						// Fetch subscription to get metadata
						const subscription = await stripe.subscriptions.retrieve(subscriptionId);
						const userId = subscription.metadata?.userId;

						if (userId) {
							// Update subscription status
							await subscriptionService.updateSubscription(userId, {
								status: "past_due",
							});
						}
					}

					break;
				}

				default:
					console.log(`Unhandled event type: ${event.type}`);
			}

			return sendSuccess(c, { message: "Webhook processed successfully" });
		} catch (error) {
			console.error("Error processing webhook:", error);
			return sendError(c, { message: "Error processing webhook", status: 500 });
		}
	});

export default subscriptionRouter;
