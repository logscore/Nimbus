import { createRedisClient, type RedisClient } from "@nimbus/cache";
import { createAuth, type Auth } from "@nimbus/auth/auth";
import { DRIVE_PROVIDER_HEADERS } from "@nimbus/shared";
import { contextStorage } from "hono/context-storage";
import env, { isEdge } from "@nimbus/env/server";
import { createDb, type DB } from "@nimbus/db";
import { createPublicRouter } from "./hono";
import { cors } from "hono/cors";
import routes from "./routes";

// Global variables that are set at runtime in order to support edge functions
let db: DB | undefined;
let redisClient: RedisClient | undefined;
let auth: Auth | undefined;
let closeDb: () => Promise<void> | undefined;
let closeRedisClient: () => Promise<void> | undefined;

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
		if (!db || !closeDb) {
			({ db, closeDb } = createDb(env.DATABASE_URL));
		}
		if (!redisClient || !closeRedisClient) {
			({ redisClient, closeRedisClient } = await createRedisClient());
		}
		if (!auth) {
			auth = createAuth(db, redisClient);
		}

		c.set("db", db);
		c.set("redisClient", redisClient);
		c.set("auth", auth);

		try {
			await next();
		} finally {
			await Promise.all([closeDb(), closeRedisClient()]);
		}
	})
	.get("/kamehame", c => c.text("HAAAAAAAAAAAAAA"))
	.route("/api", routes);

export type AppType = typeof app;

const defaultExport = {
	fetch: app.fetch,
};

if (!isEdge) {
	Object.assign(defaultExport, { port: env.SERVER_PORT });
}

export default defaultExport;
