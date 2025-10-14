import { type Subscription, type SubscriptionPlan, canAddConnection, getPlanLimits } from "@nimbus/shared";
import { subscription as subscriptionTable } from "@nimbus/db/schema";
import { eq, and } from "drizzle-orm";
import { type DB } from "@nimbus/db";
import { nanoid } from "nanoid";

export class SubscriptionService {
	constructor(private db: DB) {}

	/**
	 * Get user's active subscription
	 */
	async getUserSubscription(userId: string): Promise<Subscription | null> {
		const subscription = await this.db.query.subscription.findFirst({
			where: (table, { eq }) => eq(table.referenceId, userId),
		});

		return subscription as Subscription | null;
	}

	/**
	 * Get or create user's subscription (defaults to free plan)
	 */
	async getOrCreateSubscription(userId: string): Promise<Subscription> {
		let subscription = await this.getUserSubscription(userId);

		if (!subscription) {
			subscription = await this.createSubscription(userId, "free");
		}

		return subscription;
	}

	/**
	 * Create a new subscription for a user
	 */
	async createSubscription(userId: string, plan: SubscriptionPlan = "free"): Promise<Subscription> {
		const newSubscription = {
			id: nanoid(),
			plan,
			referenceId: userId,
			status: "active" as const,
			cancelAtPeriodEnd: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await this.db.insert(subscriptionTable).values(newSubscription);

		return newSubscription as Subscription;
	}

	/**
	 * Update user's subscription
	 */
	async updateSubscription(
		userId: string,
		updates: Partial<{
			plan: SubscriptionPlan;
			status: Subscription["status"];
			stripeCustomerId: string;
			stripeSubscriptionId: string;
			periodStart: Date;
			periodEnd: Date;
			cancelAtPeriodEnd: boolean;
		}>
	): Promise<Subscription | null> {
		await this.db
			.update(subscriptionTable)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(subscriptionTable.referenceId, userId));

		return this.getUserSubscription(userId);
	}

	/**
	 * Check if user can add a new connection based on their plan
	 */
	async canUserAddConnection(userId: string): Promise<{
		allowed: boolean;
		reason?: string;
		currentCount: number;
		maxConnections: number | null;
		plan: SubscriptionPlan;
	}> {
		// Get user's subscription
		const subscription = await this.getOrCreateSubscription(userId);

		// Count user's current connections
		const accounts = await this.db.query.account.findMany({
			where: (table, { eq }) => eq(table.userId, userId),
		});

		const currentCount = accounts.length;
		const limits = getPlanLimits(subscription.plan);
		const allowed = canAddConnection(subscription.plan, currentCount);

		return {
			allowed,
			reason: allowed
				? undefined
				: `You've reached the maximum of ${limits.maxConnections} connection(s) for the ${subscription.plan} plan`,
			currentCount,
			maxConnections: limits.maxConnections,
			plan: subscription.plan,
		};
	}

	/**
	 * Get user's connection count
	 */
	async getUserConnectionCount(userId: string): Promise<number> {
		const accounts = await this.db.query.account.findMany({
			where: (table, { eq }) => eq(table.userId, userId),
		});

		return accounts.length;
	}

	/**
	 * Upgrade user to pro plan
	 */
	async upgradeToPro(
		userId: string,
		stripeSubscriptionId: string,
		stripeCustomerId: string,
		periodStart: Date,
		periodEnd: Date
	): Promise<Subscription | null> {
		return this.updateSubscription(userId, {
			plan: "pro",
			status: "active",
			stripeSubscriptionId,
			stripeCustomerId,
			periodStart,
			periodEnd,
			cancelAtPeriodEnd: false,
		});
	}

	/**
	 * Downgrade user to free plan
	 */
	async downgradeToFree(userId: string): Promise<Subscription | null> {
		return this.updateSubscription(userId, {
			plan: "free",
			status: "active",
			periodStart: undefined,
			periodEnd: undefined,
			cancelAtPeriodEnd: false,
		});
	}

	/**
	 * Cancel subscription at period end
	 */
	async cancelSubscription(userId: string): Promise<Subscription | null> {
		return this.updateSubscription(userId, {
			cancelAtPeriodEnd: true,
		});
	}

	/**
	 * Check if subscription is active
	 */
	isSubscriptionActive(subscription: Subscription | null): boolean {
		if (!subscription) return false;

		// Check if status is active or trialing
		if (!["active", "trialing"].includes(subscription.status)) {
			return false;
		}

		// If there's a period end and it's in the past, subscription is expired
		if (subscription.periodEnd && new Date(subscription.periodEnd) < new Date()) {
			return false;
		}

		return true;
	}

	/**
	 * Get subscription stats for a user
	 */
	async getSubscriptionStats(userId: string): Promise<{
		subscription: Subscription;
		connectionCount: number;
		maxConnections: number | null;
		canAddConnection: boolean;
		isActive: boolean;
	}> {
		const subscription = await this.getOrCreateSubscription(userId);
		const connectionCount = await this.getUserConnectionCount(userId);
		const limits = getPlanLimits(subscription.plan);
		const canAdd = canAddConnection(subscription.plan, connectionCount);
		const isActive = this.isSubscriptionActive(subscription);

		return {
			subscription,
			connectionCount,
			maxConnections: limits.maxConnections,
			canAddConnection: canAdd,
			isActive,
		};
	}
}
