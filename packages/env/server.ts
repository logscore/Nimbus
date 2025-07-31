import { createEnv as createEnvCore } from "@t3-oss/env-core";
import BASE_ENV from "./base";
import { z } from "zod";

export function createEnv(runtimeEnv: NodeJS.ProcessEnv) {
	const env = createEnvCore({
		...BASE_ENV,
		runtimeEnv,

		server: {
			// Required

			// Node environment
			NODE_ENV: z
				.enum(["development", "production", "test"])
				.transform(val => (runtimeEnv.WRANGLER_DEV === "true" ? "production" : val)),

			// Edge environment
			IS_EDGE_RUNTIME: z
				.literal("true")
				.or(z.literal("false"))
				.transform(val => val === "true")
				.default(false),

			WRANGLER_DEV: z
				.literal("true")
				.or(z.literal("false"))
				.transform(val => val === "true")
				.default(false),

			// Database
			DATABASE_URL: z.url(),

			// Authentication
			BETTER_AUTH_SECRET: z.string(),
			BETTER_AUTH_URL: z.url(),

			// OAuth Providers
			GOOGLE_CLIENT_ID: z.string(),
			GOOGLE_CLIENT_SECRET: z.string(),
			MICROSOFT_CLIENT_ID: z.string(),
			MICROSOFT_CLIENT_SECRET: z.string(),

			// Server Configuration
			BACKEND_URL: z.string(),
			TRUSTED_ORIGINS: z
				.string()
				.transform(val => val.trim())
				.refine(
					val => {
						if (val === "*") return true;
						const origins = val.split(",").map(s => s.trim());
						return origins.every(origin => {
							try {
								z.url().parse(origin);
								return true;
							} catch {
								return false;
							}
						});
					},
					{
						message: 'Must be "*" or a comma-separated list of valid URLs',
					}
				)
				.transform(val => {
					if (val === "*") return ["*"];
					return val.split(",").map(s => s.trim());
				}),

			// Email
			EMAIL_FROM: z.email(),
			RESEND_API_KEY: z.string(),

			// For docker
			SERVER_PORT: z.string(),
			WEB_PORT: z.string(),
			DATABASE_HOST: z.string(),
			POSTGRES_PORT: z.string(),
			POSTGRES_USER: z.string(),
			POSTGRES_PASSWORD: z.string(),
			POSTGRES_DB: z.string(),

			// Optional (because of edge runtime support)

			// Valkey (Redis)
			VALKEY_HOST: z.string().optional(),
			VALKEY_PORT: z.string().optional(),
			VALKEY_USERNAME: z.string().optional(),
			VALKEY_PASSWORD: z.string().optional(),

			// Upstash (Redis)
			UPSTASH_REDIS_REST_URL: z.string().optional(),
			UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
		},

		// createFinalSchema(shape, isServer) {
		// 	return z.object(shape);
		// },
	});

	console.log(
		`Loaded env variables. Running in ${env.NODE_ENV.toUpperCase()} mode. IS_EDGE_RUNTIME: ${env.IS_EDGE_RUNTIME}`
	);

	return env;
}

export type Env = ReturnType<typeof createEnv>;
