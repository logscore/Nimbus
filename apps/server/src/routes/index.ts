import { createDriveProviderRouter, createProtectedRouter, createPublicRouter } from "../hono";
import { GoogleDriveProvider } from "../providers/google/google-drive";
import { OneDriveProvider } from "../providers/microsoft/one-drive";
import type { Provider } from "../providers/interface/provider";
import { driveProviderSchema } from "@nimbus/shared";
import { sendUnauthorized } from "./utils";
import waitlistRoutes from "./waitlist";
import accountRouter from "./account";
import drivesRoutes from "./drives";
import filesRoutes from "./files";
import userRouter from "./user";
import tagsRoutes from "./tags";
import authRoutes from "./auth";

const driveProviderPaths = ["/files", "/drives", "/tags"] as const;
const driveProviderRouters = [filesRoutes, drivesRoutes, tagsRoutes] as const;
const driveProviderRouter = createDriveProviderRouter()
	.use("*", async (c, next) => {
		const userId = c.var.user.id;
		const providerIdHeader = c.req.header("X-Provider-Id");
		const accountIdHeader = c.req.header("X-Account-Id");
		const parsedProviderId = driveProviderSchema.safeParse(providerIdHeader);
		if (!parsedProviderId.success || !accountIdHeader) {
			return sendUnauthorized(c, "Invalid provider or account information");
		}

		const account = await c.var.db.query.account.findFirst({
			where: (table, { and, eq }) =>
				and(
					eq(table.userId, userId),
					eq(table.providerId, parsedProviderId.data),
					eq(table.accountId, accountIdHeader)
				),
		});
		if (!account || !account.accessToken || !account.providerId || !account.accountId) {
			return sendUnauthorized(c);
		}

		const { accessToken } = await c.var.auth.api.getAccessToken({
			body: {
				providerId: account.providerId,
				accountId: account.id,
				userId: account.userId,
			},
			headers: c.req.raw.headers,
		});
		if (!accessToken) {
			return sendUnauthorized(c);
		}

		const parsedProviderName = driveProviderSchema.safeParse(account.providerId);
		if (!parsedProviderName.success) {
			return sendUnauthorized(c, "Invalid provider");
		}
		const provider: Provider =
			parsedProviderName.data === "google" ? new GoogleDriveProvider(accessToken) : new OneDriveProvider(accessToken);
		c.set("provider", provider);
		await next();
	})
	.route(driveProviderPaths[0], driveProviderRouters[0])
	.route(driveProviderPaths[1], driveProviderRouters[1])
	.route(driveProviderPaths[2], driveProviderRouters[2]);

const protectedPaths = ["/user", "/account"] as const;
const protectedRouters = [userRouter, accountRouter] as const;
const protectedRouter = createProtectedRouter()
	.use("*", async (c, next) => {
		const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers });
		const user = session?.user;
		if (!user) {
			return sendUnauthorized(c);
		}
		c.set("user", user);
		await next();
	})
	.route(protectedPaths[0], protectedRouters[0])
	.route(protectedPaths[1], protectedRouters[1])
	.route("/", driveProviderRouter);

const publicPaths = ["/auth", "/waitlist"] as const;
const publicRouters = [authRoutes, waitlistRoutes] as const;
const routes = createPublicRouter()
	.route(publicPaths[0], publicRouters[0])
	.route(publicPaths[1], publicRouters[1])
	.route("/", protectedRouter);

export default routes;
