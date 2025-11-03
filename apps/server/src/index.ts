import { contextStorage } from "hono/context-storage";
import { cacheClient } from "@nimbus/cache";
import { serve } from "@hono/node-server";
import { type HonoContext } from "./hono";
import { env } from "@nimbus/env/server";
import { auth } from "@nimbus/auth/auth";
import { cors } from "hono/cors";
import { db } from "@nimbus/db";
import routes from "./routes";
import { Hono } from "hono";

const app = new Hono<HonoContext>()
	.use(contextStorage())
	.use(
		cors({
			origin: env.TRUSTED_ORIGINS,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization", "X-Provider-Id", "X-Account-Id"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			maxAge: 43200, // 12 hours
		})
	)
	.use("*", async (c, next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			c.set("user", null);
			c.set("session", null);
			return next();
		}

		c.set("user", session.user);
		c.set("session", session.session);
		c.set("db", db);
		c.set("cache", cacheClient);
		c.set("auth", auth);
		await next();
	})
	.get("/health", c => {
		c.status(200);
		return c.text("OK");
	})
	.route("/api", routes);

export type AppType = typeof app;

const server = serve({
	fetch: app.fetch,
	port: env.SERVER_PORT,
});

// graceful shutdown
process.on("SIGINT", () => {
	server.close();
	process.exit(0);
});
process.on("SIGTERM", () => {
	server.close(err => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		process.exit(0);
	});
});
