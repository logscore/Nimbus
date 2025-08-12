import { DRIVE_PROVIDER_HEADERS } from "@nimbus/shared";
import { contextStorage } from "hono/context-storage";
import { createPublicRouter } from "./hono";
import { ContextManager } from "./context";
import { timeout } from "hono/timeout";
import { cors } from "hono/cors";
import routes from "./routes";

const app = createPublicRouter()
	.use(contextStorage())
	.use("*", async (c, next) => {
		const contextManager = ContextManager.getInstance();
		const env = contextManager.env;
		c.set("contextManager", contextManager);
		c.set("env", env);
		await next();
	})
	.use(
		cors({
			origin: (_origin, c) => c.var.env.TRUSTED_ORIGINS,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization", ...DRIVE_PROVIDER_HEADERS],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			maxAge: 43200, // 12 hours
		})
	)
	.use(
		"*",
		async (c, next) => {
			const env = c.var.env;
			const { db, redisClient, auth } = await c.var.contextManager.createContext();
			c.set("db", db);
			c.set("redisClient", redisClient);
			c.set("auth", auth);
			try {
				await next();
			} finally {
				// WARNING: make sure to add WRANGLER_DEV to .dev.vars for wrangler dev
				// for local dev, always keep context open UNLESS wrangler dev, close context
				if (env.IS_EDGE_RUNTIME && (env.NODE_ENV === "production" || env.WRANGLER_DEV)) {
					await c.var.contextManager.close();
				}
			}
		},
		timeout(5000)
	)
	.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"))
	.route("/api", routes);

export type AppType = typeof app;

const handler = {
	port: process.env.SERVER_PORT,
	async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
		return app.fetch(request, env, ctx);
	},
};

export default handler;
