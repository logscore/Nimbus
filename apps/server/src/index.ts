import { contextStorage } from "hono/context-storage";
import { createAuth } from "@nimbus/auth/auth";
import type { HonoContext } from "./ctx";
import { createDb } from "@nimbus/db";
import { cors } from "hono/cors";
import env from "@nimbus/env";
import routes from "@/routes";
import { Hono } from "hono";

const app = new Hono<HonoContext>();

app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		maxAge: 43200, // 12 hours
	})
);

app.use(contextStorage()).use("*", async (c, next) => {
	const db = createDb(env.DATABASE_URL);
	c.set("db", db);
	const auth = createAuth();
	c.set("auth", auth);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	c.set("user", session?.user);
	await next();
});

app.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"));

app.route("/api", routes);

export default {
	port: 1284,
	fetch: app.fetch,
};
