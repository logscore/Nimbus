import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]),

		DATABASE_URL: z.url(),
		DATABASE_HOST: z.string(),
		POSTGRES_PORT: z.string(),
		POSTGRES_USER: z.string(),
		POSTGRES_PASSWORD: z.string(),
		POSTGRES_DB: z.string(),

		// Authentication
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),

		// OAuth Providers
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		MICROSOFT_CLIENT_ID: z.string(),
		MICROSOFT_CLIENT_SECRET: z.string(),
		BOX_CLIENT_ID: z.string(),
		BOX_CLIENT_SECRET: z.string(),
		DROPBOX_CLIENT_ID: z.string(),
		DROPBOX_CLIENT_SECRET: z.string(),

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
		EMAIL_FROM: z.email().optional(),
		RESEND_API_KEY: z.string().optional(),

		// For docker
		SERVER_PORT: z.coerce.number(),
		WEB_PORT: z.coerce.number(),

		// Valkey (Redis)
		VALKEY_HOST: z.string(),
		VALKEY_PORT: z.string(),
		VALKEY_USERNAME: z.string(),
		VALKEY_PASSWORD: z.string(),
	},

	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
