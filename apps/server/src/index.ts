import { createRedisClient, type RedisClient } from "@nimbus/cache";
import { createAuth, type Auth } from "@nimbus/auth/auth";
import { DRIVE_PROVIDER_HEADERS } from "@nimbus/shared";
import { contextStorage } from "hono/context-storage";
import { createEnv } from "@nimbus/env/server";
import { createDb, type DB } from "@nimbus/db";
import { createPublicRouter } from "./hono";
import { cors } from "hono/cors";
import { Resend } from "resend";
import routes from "./routes";

// Global variables that are set at runtime in order to support edge functions
let db: DB | undefined;
let redisClient: RedisClient | undefined;
let auth: Auth | undefined;
let closeDb: (() => Promise<void>) | undefined;
let closeRedisClient: (() => Promise<void>) | undefined;

const app = createPublicRouter()
	.use(contextStorage())
	.use("*", async (c, next) => {
		// https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/#relationship-to-per-request-env-argument-in-fetch-handlers
		if (c.env) {
			Object.entries(c.env).forEach(([key, value]) => {
				if (typeof value === "string") {
					process.env[key] = value;
				}
			});
		}
		const env = createEnv(process.env);
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
		const env = c.var.env;

		if (!db || !closeDb) {
			({ db, closeDb } = createDb(env));
		}
		if (!redisClient || !closeRedisClient) {
			({ redisClient, closeRedisClient } = await createRedisClient(env));
		}

		const resend = new Resend(env.RESEND_API_KEY);
		if (!auth) {
			auth = createAuth(env, db, redisClient, resend);
		}

		c.set("db", db);
		c.set("redisClient", redisClient);
		c.set("auth", auth);

		try {
			await next();
		} catch (error) {
			console.error(error);
			await Promise.all([closeDb().catch(console.error), closeRedisClient().catch(console.error)]);
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
	const env = createEnv(process.env);
	Object.assign(handler, {
		port: env.SERVER_PORT,
		...app,
	});
}

export default handler;
