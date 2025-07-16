import { DRIVE_PROVIDER_HEADERS } from "@nimbus/shared";
import { contextStorage } from "hono/context-storage";
import { createAuth } from "@nimbus/auth/auth";
import { createPublicRouter } from "./hono";
import { createDb } from "@nimbus/db";
import env from "@nimbus/env/server";
import { cors } from "hono/cors";
import routes from "./routes";

const app = createPublicRouter()
	.use(
		cors({
			origin: env.FRONTEND_URL,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization", ...DRIVE_PROVIDER_HEADERS],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			maxAge: 43200, // 12 hours
		})
	)
	.use(contextStorage())
	.use("*", async (c, next) => {
		const db = createDb(env.DATABASE_URL);
		const auth = createAuth();
		c.set("db", db);
		c.set("auth", auth);
		await next();
	})
	.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"))
	.route("/api", routes);

export type AppType = typeof app;

export default {
	port: env.SERVER_PORT,
	fetch: app.fetch,
};
