#!/usr/bin/env bun

/**
 * Migration Script: Add Free Subscriptions for Existing Users
 *
 * This script creates free plan subscriptions for any existing users
 * who don't have a subscription record.
 *
 * Usage: bun run scripts/migrate-subscriptions.ts
 */

import { subscription as subscriptionTable } from "@nimbus/db/schema";
import { db } from "@nimbus/db";
import { nanoid } from "nanoid";

async function migrateSubscriptions() {
	console.log("🚀 Starting subscription migration...\n");

	try {
		// Get all users
		const users = await db.query.user.findMany({
			columns: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
			},
		});

		console.log(`📊 Found ${users.length} total users`);

		if (users.length === 0) {
			console.log("✅ No users found. Migration complete.");
			return;
		}

		// Get all existing subscriptions
		const existingSubscriptions = await db.query.subscription.findMany({
			columns: {
				referenceId: true,
			},
		});

		const userIdsWithSubscription = new Set(existingSubscriptions.map(sub => sub.referenceId));
		console.log(`📋 Found ${existingSubscriptions.length} existing subscriptions\n`);

		// Filter users without subscriptions
		const usersWithoutSubscription = users.filter(user => !userIdsWithSubscription.has(user.id));

		if (usersWithoutSubscription.length === 0) {
			console.log("✅ All users already have subscriptions. Nothing to migrate.");
			return;
		}

		console.log(`🔄 Creating subscriptions for ${usersWithoutSubscription.length} users...\n`);

		// Create free subscriptions for users without one
		const subscriptionsToCreate = usersWithoutSubscription.map(user => ({
			id: nanoid(),
			plan: "free" as const,
			referenceId: user.id,
			status: "active" as const,
			cancelAtPeriodEnd: false,
			stripeCustomerId: null,
			stripeSubscriptionId: null,
			periodStart: null,
			periodEnd: null,
			seats: null,
			trialStart: null,
			trialEnd: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		// Insert in batches of 100
		const batchSize = 100;
		let created = 0;
		let failed = 0;

		for (let i = 0; i < subscriptionsToCreate.length; i += batchSize) {
			const batch = subscriptionsToCreate.slice(i, i + batchSize);

			try {
				await db.insert(subscriptionTable).values(batch);
				created += batch.length;
				console.log(`  ✓ Created ${batch.length} subscriptions (${created}/${subscriptionsToCreate.length})`);
			} catch (error) {
				failed += batch.length;
				console.error(`  ✗ Failed to create batch:`, error);
			}
		}

		console.log("\n" + "=".repeat(50));
		console.log("📈 Migration Summary:");
		console.log("=".repeat(50));
		console.log(`Total users:                ${users.length}`);
		console.log(`Users with subscriptions:   ${existingSubscriptions.length}`);
		console.log(`Users without subscriptions: ${usersWithoutSubscription.length}`);
		console.log(`Successfully created:        ${created}`);
		console.log(`Failed:                      ${failed}`);
		console.log("=".repeat(50));

		if (failed > 0) {
			console.error("\n⚠️  Some subscriptions failed to create. Check the errors above.");
			process.exit(1);
		} else {
			console.log("\n✅ Migration completed successfully!");
		}
	} catch (error) {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	}
}

// Run the migration
migrateSubscriptions()
	.then(() => {
		console.log("\n👋 Done!");
		process.exit(0);
	})
	.catch(error => {
		console.error("\n💥 Unexpected error:", error);
		process.exit(1);
	});
