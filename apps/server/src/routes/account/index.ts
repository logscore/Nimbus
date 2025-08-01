import {
	limitedAccessAccountSchema,
	updateAccountSchema,
	createS3AccountSchema,
	type UpdateAccountSchema,
	type CreateS3AccountSchema,
} from "@nimbus/shared";
/**
 * In-memory rate limiting for account creation endpoints.
 * Prevents abuse by limiting the number of account creation attempts per user.
 */
const accountCreationAttempts = new Map<string, { count: number; resetTime: number }>();

/**
 * Creates a rate limiting middleware for account creation endpoints.
 * Implements sliding window rate limiting with configurable limits.
 *
 * @param maxAttempts - Maximum number of attempts allowed per window
 * @param windowMs - Time window in milliseconds for rate limiting
 * @returns Hono middleware function
 */
function createAccountRateLimit(maxAttempts = 5, windowMs = 10 * 60 * 1000) {
	return async (c: any, next: any) => {
		const userId = c.var.user?.id;
		if (!userId) return next();

		const now = Date.now();
		const userAttempts = accountCreationAttempts.get(userId);

		if (userAttempts && now < userAttempts.resetTime) {
			if (userAttempts.count >= maxAttempts) {
				return c.json(
					{
						message: "Rate limit exceeded. Too many account creation attempts. Please try again later.",
					},
					429
				);
			}
			userAttempts.count++;
		} else {
			// Reset or initialize attempt counter
			accountCreationAttempts.set(userId, { count: 1, resetTime: now + windowMs });
		}

		return next();
	};
}
import { account as accountTable } from "@nimbus/db/schema";
import { createProtectedRouter } from "../../hono";
import { sendSuccess, sendError } from "../utils";
import { encrypt } from "../../utils/encryption";
import { zValidator } from "@hono/zod-validator";
import { S3Provider } from "../../providers/s3";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// TODO(rate-limiting): implement for accounts

const accountRouter = createProtectedRouter()
	.get("/", async c => {
		const accounts = await c.var.db.query.account.findMany({
			where: (table, { eq }) => eq(table.userId, c.var.user.id),
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
	})
	.put("/", zValidator("json", updateAccountSchema), async c => {
		const data: UpdateAccountSchema = c.req.valid("json");
		const metadata = { nickname: data.nickname };
		await c.var.db.update(accountTable).set(metadata).where(eq(accountTable.id, data.id));
		return sendSuccess(c, { message: "Account updated successfully" });
	})
	.use("/s3", createAccountRateLimit(5, 10 * 60 * 1000)) // 5 attempts per 10 minutes
	.post("/s3", zValidator("json", createS3AccountSchema), async c => {
		const data: CreateS3AccountSchema = c.req.valid("json");

		try {
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
				userId: c.var.user.id,
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
	});

export default accountRouter;
