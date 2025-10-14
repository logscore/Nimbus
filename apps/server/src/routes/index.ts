import type { Provider } from "../providers/interface/provider";
import { OneDriveProvider } from "../providers/microsoft";
import { GoogleDriveProvider } from "../providers/google";
import { sendForbidden, sendUnauthorized } from "./utils";
import { DropboxProvider } from "../providers/dropbox";
import { driveProviderSchema } from "@nimbus/shared";
import subscriptionRouter from "./subscription";
import { BoxProvider } from "../providers/box";
import { decrypt } from "../utils/encryption";
import { S3Provider } from "../providers/s3";
import { type HonoContext } from "../hono";
import { env } from "@nimbus/env/server";
import waitlistRoutes from "./waitlist";
import accountRouter from "./account";
import drivesRoutes from "./drives";
import filesRoutes from "./files";
import userRouter from "./user";
import tagsRoutes from "./tags";
import authRoutes from "./auth";
import { Hono } from "hono";

const driveRouter = new Hono<HonoContext>()
	.use("*", async (c, next) => {
		const user = c.var.user;
		if (!user) {
			return sendUnauthorized(c, "Unauthorized");
		}
		const providerIdHeader = decodeURIComponent(c.req.header("X-Provider-Id") || "");
		const accountIdHeader = decodeURIComponent(c.req.header("X-Account-Id") || "");

		const parsedProviderId = driveProviderSchema.safeParse(providerIdHeader);
		if (!parsedProviderId.success || !accountIdHeader) {
			return sendForbidden(c, "Invalid provider or account information");
		}
		const account = await c.var.db.query.account.findFirst({
			where: (table, { and, eq }) =>
				and(
					eq(table.userId, user.id),
					eq(table.providerId, parsedProviderId.data),
					eq(table.accountId, accountIdHeader)
				),
		});

		if (!account || !account.providerId || !account.accountId) {
			return sendForbidden(c);
		}

		const parsedProviderName = driveProviderSchema.safeParse(account.providerId);
		if (!parsedProviderName.success) {
			return sendForbidden(c, "Invalid provider");
		}

		let provider: Provider;

		// Handle S3 provider separately (no access token needed)
		if (parsedProviderName.data === "s3") {
			if (!account.s3AccessKeyId || !account.s3SecretAccessKey || !account.s3Region || !account.s3BucketName) {
				return sendUnauthorized(c, "Missing S3 credentials");
			}

			provider = new S3Provider({
				accessKeyId: account.s3AccessKeyId,
				secretAccessKey: decrypt(account.s3SecretAccessKey),
				region: account.s3Region,
				bucketName: account.s3BucketName,
				endpoint: account.s3Endpoint || undefined,
			});
			c.set("provider", provider);
		} else {
			// Handle OAuth providers (Google, Microsoft)
			if (!account.accessToken) {
				return sendForbidden(c);
			}

			try {
				const { accessToken } = await c.var.auth.api.getAccessToken({
					body: {
						providerId: account.providerId,
						accountId: account.id,
						userId: account.userId,
					},
					headers: c.req.raw.headers,
				});

				if (!accessToken) {
					return sendUnauthorized(c, "Access token not available. Please re-authenticate.");
				}

				if (parsedProviderName.data === "google") {
					provider = new GoogleDriveProvider(accessToken);
				} else if (parsedProviderName.data === "microsoft") {
					provider = new OneDriveProvider(accessToken);
				} else if (parsedProviderName.data === "box") {
					provider = new BoxProvider(accessToken, env.BOX_CLIENT_ID, env.BOX_CLIENT_SECRET);
				} else if (parsedProviderName.data === "dropbox") {
					provider = new DropboxProvider(accessToken);
				} else {
					return sendForbidden(c, "Unsupported provider");
				}
				c.set("provider", provider);
			} catch (error) {
				// @ts-ignore
				if (error?.body?.code === "FAILED_TO_GET_A_VALID_ACCESS_TOKEN") {
					return sendUnauthorized(c, "Authentication expired. Please sign in again.");
				}
				throw error;
			}
		}

		await next();
	})
	.route("/files", filesRoutes)
	.route("/drives", drivesRoutes)
	.route("/tags", tagsRoutes);

const protectedRouter = new Hono<HonoContext>()
	.use("*", async (c, next) => {
		const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers });
		const user = session?.user;
		if (!user) {
			return sendForbidden(c);
		}
		c.set("user", user);
		await next();
	})
	.route("/user", userRouter)
	.route("/account", accountRouter)
	.route("/subscription", subscriptionRouter)
	.route("/", driveRouter);

const apiRoutes = new Hono<HonoContext>()
	.route("/auth", authRoutes)
	.route("/waitlist", waitlistRoutes)
	.route("/", protectedRouter);

export default apiRoutes;
