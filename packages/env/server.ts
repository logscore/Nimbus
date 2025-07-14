import { createEnv } from "@t3-oss/env-core";
import BASE_ENV from "./base";
import { z } from "zod";

export const env = createEnv({
	...BASE_ENV,
	server: {
		// Required

		// Node environment
		NODE_ENV: z.enum(["development", "production", "test"]),

		// Database
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

		// Server Configuration
		SERVER_PORT: z.string(),
		WEB_PORT: z.string(),
		FRONTEND_URL: z.string(),
		BACKEND_URL: z.string(),

		// Email
		EMAIL_FROM: z.email(),
		RESEND_API_KEY: z.string(),

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

// Export the typed environment variables
export { isEdge } from "./base";
export default env;
