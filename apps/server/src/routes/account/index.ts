import {
	createS3AccountSchema,
	limitedAccessAccountSchema,
	updateAccountSchema,
	type CreateS3AccountSchema,
	type UpdateAccountSchema,
} from "@nimbus/shared";
import { SubscriptionService } from "../../services/subscription-service";
import { sendError, sendSuccess, sendUnauthorized } from "../utils";
import { createRateLimiter } from "@nimbus/cache/rate-limiters";
import { account as accountTable } from "@nimbus/db/schema";
import { securityMiddleware } from "../../middleware";
import { encrypt } from "../../utils/encryption";
import { zValidator } from "@hono/zod-validator";
import { S3Provider } from "../../providers/s3";
import { type HonoContext } from "../../hono";
import { cacheClient } from "@nimbus/cache";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Hono } from "hono";

// TODO(rate-limiting): implement for accounts

const accountRouter = new Hono<HonoContext>()
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
						keyPrefix: `get-account-`,
					}),
			},
		}),
		async c => {
			// There has to be a better, more elegant way of handling this in the routes. Perhaps a middleware?
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}

			const accounts = await c.var.db.query.account.findMany({
				where: (table, { eq }) => eq(table.userId, user.id),
			});
			const limitedAccessAccounts = accounts.map(account => ({
				id: account.id,
				providerId: account.providerId,
				accountId: account.accountId,
				scope: account.scope,
				nickname: account.nickname,
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
			}));
			const limitedAccessAccountsParsed = limitedAccessAccountSchema.array().parse(limitedAccessAccounts);
			return sendSuccess(c, { data: limitedAccessAccountsParsed });
		}
	)
	.put(
		"/",
		zValidator("json", updateAccountSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `put-account-`,
					}),
			},
		}),
		async c => {
			const data: UpdateAccountSchema = c.req.valid("json");
			const metadata = { nickname: data.nickname };
			await c.var.db.update(accountTable).set(metadata).where(eq(accountTable.id, data.id));
			return sendSuccess(c, { message: "Account updated successfully" });
		}
	)
	.post(
		"/s3",
		zValidator("json", createS3AccountSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `post-account-s3-`,
					}),
			},
		}),
		async c => {
			const userId = c.var.user?.id;
			if (!userId) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const data: CreateS3AccountSchema = c.req.valid("json");

			try {
				// Check subscription limits
				const subscriptionService = new SubscriptionService(c.var.db);
				const canAdd = await subscriptionService.canUserAddConnection(userId);

				if (!canAdd.allowed) {
					return sendError(c, {
						message: canAdd.reason || "You have reached your connection limit",
						status: 403,
					});
				}

				const testProvider = new S3Provider({
					accessKeyId: data.accessKeyId,
					secretAccessKey: data.secretAccessKey,
					region: data.region,
					bucketName: data.bucketName,
					endpoint: data.endpoint,
				});

				const driveInfo = await testProvider.getDriveInfo();
				if (!driveInfo) {
					return sendError(c, { message: "Failed to connect to S3. Please check your configuration.", status: 400 });
				}

				const accountId = nanoid();
				const s3Account = {
					id: nanoid(),
					accountId: accountId,
					providerId: "s3" as const,
					userId: userId,
					nickname: data.nickname,
					scope: "s3",
					s3AccessKeyId: data.accessKeyId,
					s3SecretAccessKey: encrypt(data.secretAccessKey),
					s3Region: data.region,
					s3BucketName: data.bucketName,
					s3Endpoint: data.endpoint,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				await c.var.db.insert(accountTable).values(s3Account);

				return sendSuccess(c, {
					message: "S3 account added successfully",
					data: {
						id: s3Account.id,
						accountId: s3Account.accountId,
						providerId: s3Account.providerId,
						nickname: s3Account.nickname,
					},
				});
			} catch (error) {
				console.error("Error creating S3 account:", error);
				return sendError(c, { message: "Failed to connect to S3. Please check your configuration.", status: 400 });
			}
		}
	);

export default accountRouter;
