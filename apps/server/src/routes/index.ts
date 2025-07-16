import { createDriveProviderRouter, createProtectedRouter, createPublicRouter } from "../hono";
import { GoogleDriveProvider } from "../providers/google/google-drive";
import { OneDriveProvider } from "../providers/microsoft/one-drive";
import type { Provider } from "../providers/interface/provider";
import { driveProviderSchema } from "@nimbus/shared";
import { sendUnauthorized } from "./utils";
import waitlistRoutes from "./waitlist";
import drivesRoutes from "./drives";
import filesRoutes from "./files";
import userRoutes from "./user";
import tagsRoutes from "./tags";
import authRoutes from "./auth";

const driveProviderRoutePaths = ["/files", "/drives", "/tags"] as const;
const driveProviderRouteRouters = [filesRoutes, drivesRoutes, tagsRoutes] as const;
const driveProviderRouter = createDriveProviderRouter()
	// .use("/:providerId/:accountId", zValidator("param", driveProviderParamSchema), async (c, next) => {
	.use("*", async (c, next) => {
		const userId = c.var.user.id;
		// const providerIdHeader = c.req.valid("param").providerId;
		// const accountIdHeader = c.req.valid("param").accountId;
		const providerIdHeader = c.req.header("X-Provider-Id");
		const accountIdHeader = c.req.header("X-Account-Id");
		const parsedProviderId = driveProviderSchema.parse(providerIdHeader);
		if (!parsedProviderId || !accountIdHeader) {
			return sendUnauthorized(c, "Invalid provider or account information");
		}

		const account = await c.var.db.query.account.findFirst({
			where: (table, { eq }) =>
				eq(table.userId, userId) && eq(table.providerId, parsedProviderId) && eq(table.accountId, accountIdHeader),
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

		const parsedProviderName = driveProviderSchema.parse(account.providerId);
		if (parsedProviderName !== account.providerId) {
			return sendUnauthorized(c, "Invalid provider");
		}
		const provider: Provider =
			parsedProviderName === "google" ? new GoogleDriveProvider(accessToken) : new OneDriveProvider(accessToken);
		c.set("provider", provider);
		return next();
	})
	.route(driveProviderRoutePaths[0], driveProviderRouteRouters[0])
	.route(driveProviderRoutePaths[1], driveProviderRouteRouters[1])
	.route(driveProviderRoutePaths[2], driveProviderRouteRouters[2]);

const protectedRoutePaths = ["/user"] as const;
const protectedRouteRouters = [userRoutes] as const;
const protectedRouter = createProtectedRouter()
	.use("*", async (c, next) => {
		const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers });
		const user = session?.user;
		if (!user) {
			return sendUnauthorized(c);
		}
		c.set("user", user);
		return next();
	})
	.route(protectedRoutePaths[0], protectedRouteRouters[0])
	.route("/", driveProviderRouter);

const publicRoutePaths = ["/auth", "/waitlist"] as const;
const publicRouteRouters = [authRoutes, waitlistRoutes] as const;
const routes = createPublicRouter()
	.route(publicRoutePaths[0], publicRouteRouters[0])
	.route(publicRoutePaths[1], publicRouteRouters[1])
	.route("/", protectedRouter);

export default routes;
