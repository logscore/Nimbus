interface PostgresEnv {
	DATABASE_URL: string;
	DATABASE_HOST: string;
	POSTGRES_PORT: string;
	POSTGRES_USER: string;
	POSTGRES_PASSWORD: string;
	POSTGRES_DB: string;
}

interface UpstashEnv {
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
}

interface ValkeyEnv {
	VALKEY_PORT: string;
	VALKEY_HOST: string;
	VALKEY_USERNAME: string;
	VALKEY_PASSWORD: string;
}

interface BetterAuthEnv {
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
}

interface ServerEnv extends PostgresEnv {
	SERVER_PORT: string;
	FRONTEND_URL: string;
}

interface WebEnv {
	WEB_PORT: string;
	BACKEND_URL: string;
	NEXT_PUBLIC_BACKEND_URL: string;
	NEXT_PUBLIC_FRONTEND_URL: string;
}

interface OAuthEnv {
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;

	MICROSOFT_CLIENT_ID: string;
	MICROSOFT_CLIENT_SECRET: string;
}

interface EmailEnv {
	EMAIL_FROM: string;
	RESEND_API_KEY: string;
}

interface BaseEnv extends BetterAuthEnv, WebEnv {}

interface BaseCache extends ValkeyEnv {}
interface EdgeRuntimeCache extends UpstashEnv {}

interface DevelopmentServerEnv extends ServerEnv, BaseCache, Partial<OAuthEnv>, Partial<EmailEnv> {}
interface ProductionServerEnv extends ServerEnv, BaseCache, OAuthEnv, EmailEnv {}
interface EdgeRuntimeDevelopmentServerEnv extends ServerEnv, EdgeRuntimeCache, Partial<OAuthEnv>, Partial<EmailEnv> {}
interface EdgeRuntimeProductionServerEnv extends ServerEnv, EdgeRuntimeCache, OAuthEnv, EmailEnv {}

interface NodeDevelopmentEnv extends BaseEnv {
	NODE_ENV: "development";
}
interface NodeProductionEnv extends BaseEnv {
	NODE_ENV: "production";
}

export interface DevelopmentEnv extends NodeDevelopmentEnv, DevelopmentServerEnv {}
export interface ProductionEnv extends NodeProductionEnv, ProductionServerEnv {}
export interface EdgeRuntimeDevelopmentEnv extends NodeDevelopmentEnv, EdgeRuntimeDevelopmentServerEnv {}
export interface EdgeRuntimeProductionEnv extends NodeProductionEnv, EdgeRuntimeProductionServerEnv {}
