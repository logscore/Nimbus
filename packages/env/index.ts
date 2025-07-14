import type { DevelopmentEnv, EdgeRuntimeDevelopmentEnv, EdgeRuntimeProductionEnv, ProductionEnv } from "./types";

// This is the type that will be exported - it will be one of the specific environment types
type Env = DevelopmentEnv | ProductionEnv | EdgeRuntimeDevelopmentEnv | EdgeRuntimeProductionEnv;

// This will be set based on the runtime environment
export let isEdge = false;

function getRequiredEnvVars(env: Record<string, string | undefined>): string[] {
	const isEdgeRuntime =
		isEdge ||
		(env as Partial<EdgeRuntimeDevelopmentEnv | EdgeRuntimeProductionEnv>).UPSTASH_REDIS_REST_URL !== undefined;

	const requiredVars: string[] = [
		// Base environment
		"NODE_ENV",
		"BETTER_AUTH_SECRET",
		"BETTER_AUTH_URL",

		// Web environment
		"WEB_PORT",
		"BACKEND_URL",
		"NEXT_PUBLIC_BACKEND_URL",
		"NEXT_PUBLIC_FRONTEND_URL",

		// Server environment
		"SERVER_PORT",
		"FRONTEND_URL",

		// Database
		"DATABASE_URL",
		"DATABASE_HOST",
		"POSTGRES_PORT",
		"POSTGRES_USER",
		"POSTGRES_PASSWORD",
		"POSTGRES_DB",

		// Cache (either Valkey or Upstash)
		...(!isEdgeRuntime
			? ["VALKEY_HOST", "VALKEY_PORT", "VALKEY_USERNAME", "VALKEY_PASSWORD"]
			: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]),
	];

	// Add OAuth and Email variables in production
	if (env.NODE_ENV === "production") {
		requiredVars.push(
			"GOOGLE_CLIENT_ID",
			"GOOGLE_CLIENT_SECRET",
			"MICROSOFT_CLIENT_ID",
			"MICROSOFT_CLIENT_SECRET",
			"EMAIL_FROM",
			"RESEND_API_KEY"
		);
	}

	return requiredVars;
}

function validateEnv(env: Record<string, string | undefined>): Env {
	const missingVars: string[] = [];
	const requiredVars = getRequiredEnvVars(env);

	// Check for missing required variables
	for (const key of requiredVars) {
		if (env[key] === undefined || env[key] === "") {
			missingVars.push(key);
		}
	}

	if (missingVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
	}

	// Type assertion - we've validated all required fields exist
	return env as unknown as Env;
}

async function setupEnv(): Promise<Env> {
	let envVars: Record<string, string | undefined> = {};

	try {
		// Check if we're in a Cloudflare Workers environment
		if (
			(globalThis as any).Cloudflare &&
			typeof process === "undefined" &&
			(globalThis as any).WebSocketPair !== undefined
		) {
			isEdge = true;

			// This will only work at runtime in Cloudflare Workers
			const { env } = await import("cloudflare:workers");
			envVars = { ...env } as Record<string, string | undefined>;
		} else if (typeof process !== "undefined") {
			envVars = { ...process.env };
		} else {
			throw new Error("Neither Cloudflare or Node.js environment detected");
		}
	} catch (error) {
		throw new Error("Failed to load environment variables", { cause: error });
	}

	// Check if we have the required edge runtime environment variables
	const hasEdgeVars = "UPSTASH_REDIS_REST_URL" in envVars && "UPSTASH_REDIS_REST_TOKEN" in envVars;
	isEdge = isEdge || hasEdgeVars;

	const validatedEnv = validateEnv(envVars);

	// Return the appropriate type based on the environment
	if (isEdge) {
		// We know these properties exist because we've already validated them in validateEnv
		const edgeEnv = {
			...validatedEnv,
			UPSTASH_REDIS_REST_URL: (validatedEnv as any).UPSTASH_REDIS_REST_URL,
			UPSTASH_REDIS_REST_TOKEN: (validatedEnv as any).UPSTASH_REDIS_REST_TOKEN,
		} as EdgeRuntimeDevelopmentEnv | EdgeRuntimeProductionEnv;

		return edgeEnv;
	}

	// For non-edge environments, we know these properties exist due to validation
	const nodeEnv = {
		...validatedEnv,
		VALKEY_HOST: (validatedEnv as any).VALKEY_HOST,
		VALKEY_PORT: (validatedEnv as any).VALKEY_PORT,
		VALKEY_USERNAME: (validatedEnv as any).VALKEY_USERNAME,
		VALKEY_PASSWORD: (validatedEnv as any).VALKEY_PASSWORD,
	} as DevelopmentEnv | ProductionEnv;

	return nodeEnv;
}

// This will be properly typed based on the actual environment
const env = await setupEnv();

// Export the environment with the correct type
export default env;
