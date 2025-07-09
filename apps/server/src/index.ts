import { auth, type Session } from "@nimbus/auth/auth";
import { createDb, type DB } from "@nimbus/db";
import { cors } from "hono/cors";
import env from "@nimbus/env";
import routes from "@/routes";
import { Hono } from "hono";

export interface ReqVariables {
	user: Session["user"] | null;
	session: Session["session"] | null;
	db: DB | null;
}

const app = new Hono<{ Variables: ReqVariables }>();

app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		maxAge: 43200, // 12 hours
	})
);

app.use("*", async (c, next) => {
	const session = await auth().api.getSession({ headers: c.req.raw.headers });

	// TODO: Add auth middleware and ratelimiting to the drive operations endpoints.
	if (!session) {
		c.set("db", null);
		c.set("user", null);
		c.set("session", null);
		// return c.json({ error: "Unauthorized" }, 401);
		return next();
	}

	c.set("db", createDb(env.DATABASE_URL));
	c.set("user", session.user);
	c.set("session", session.session);
	return next();
});

app.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"));

app.route("/api", routes);

export default {
	port: 1284,
	fetch: app.fetch,
};
