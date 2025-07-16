import { serverEnv } from "@/lib/env/server-env";
import { auth } from "@nimbus/auth/auth";
import { cors } from "hono/cors";
import { db } from "@nimbus/db";
import routes from "@/routes";
import { Hono } from "hono";

export interface ReqVariables {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
	db: typeof db | null;
}

const app = new Hono<{ Variables: ReqVariables }>();

app.use(
	cors({
		origin: serverEnv.FRONTEND_URL,
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		maxAge: 43200, // 12 hours
	})
);

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	// TODO: Add auth middleware and ratelimiting to the drive operations endpoints.
	if (!session) {
		c.set("db", null);
		c.set("user", null);
		c.set("session", null);
		// return c.json({ error: "Unauthorized" }, 401);
		return next();
	}

	c.set("db", db);
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
