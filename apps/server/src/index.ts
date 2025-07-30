import { DRIVE_PROVIDER_HEADERS } from "@nimbus/shared";
import { contextStorage } from "hono/context-storage";
import { createPublicRouter } from "./hono";
import { ContextManager } from "./context";
import { cors } from "hono/cors";
import routes from "./routes";

const app = createPublicRouter()
	.use(contextStorage())
	.use("*", async (c, next) => {
		const env = ContextManager.getInstance().env;
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
	.use("*", async (c, next) => {
		const { env, db, redisClient, auth } = await ContextManager.getInstance().createContext();
		c.set("db", db);
		c.set("redisClient", redisClient);
		c.set("auth", auth);
		try {
			await next();
		} finally {
			if (env.IS_EDGE_RUNTIME) {
				await ContextManager.getInstance().close();
			}
		}
	})
	.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"))
	.route("/api", routes);

export type AppType = typeof app;

// Create a wrapper that handles the environment initialization
const handler = {
	async fetch(request: Request, env: any, ctx: any) {
		return app.fetch(request, env, ctx);
	},
};

// For non-edge environments, we'll use the original app with the port
if (process.env.IS_EDGE_RUNTIME !== "true") {
	Object.assign(handler, {
		port: process.env.SERVER_PORT,
		...app,
	});
}

export default handler;
