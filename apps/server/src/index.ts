import { contextStorage } from "hono/context-storage";
import { createPublicRouter } from "./hono";
import { createDb } from "@nimbus/db";
import env from "@nimbus/env/server";
import { cors } from "hono/cors";
import routes from "@/routes";

const app = createPublicRouter()
	.use(
		cors({
			origin: env.FRONTEND_URL,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			maxAge: 43200, // 12 hours
		})
	)
	.use(contextStorage())
	.use("*", async (c, next) => {
		const db = createDb(env.DATABASE_URL);
		c.set("db", db);
		await next();
	})
	.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"))
	.route("/api", routes);

export type AppType = typeof app;

export default {
	port: 1284,
	fetch: app.fetch,
};
