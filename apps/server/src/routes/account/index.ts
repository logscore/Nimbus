import {
	limitedAccessAccountSchema,
	updateAccountSchema,
	createS3AccountSchema,
	type UpdateAccountSchema,
	type CreateS3AccountSchema,
} from "@nimbus/shared";
import { accountCreationRateLimiter } from "@nimbus/cache/rate-limiters";
import { buildUserSecurityMiddleware } from "../../middleware/security";
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
	.use("/s3", buildUserSecurityMiddleware(accountCreationRateLimiter))
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
