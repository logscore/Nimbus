import type { Provider } from "./providers/interface/provider";
import type { Auth, SessionUser } from "@nimbus/auth/auth";
import { getContext } from "hono/context-storage";
import type { RedisClient } from "@nimbus/cache";
import { Hono, type Env } from "hono";
import type { DB } from "@nimbus/db";

export interface publicRouterVars {
	db: DB;
	redisClient: RedisClient;
	auth: Auth;
}

export interface protectedRouterVars extends publicRouterVars {
	user: SessionUser;
}

export interface driveProviderRouterVars extends protectedRouterVars {
	provider: Provider;
}

export interface PublicRouterEnv {
	Variables: publicRouterVars;
}

export interface ProtectedRouterEnv {
	Variables: protectedRouterVars;
}

export interface DriveProviderRouterEnv {
	Variables: driveProviderRouterVars;
}

function createHono<T extends Env>() {
	return new Hono<T>();
}

export function createPublicRouter() {
	return createHono<PublicRouterEnv>();
}

export function createProtectedRouter() {
	return createHono<ProtectedRouterEnv>();
}

export function createDriveProviderRouter() {
	return createHono<DriveProviderRouterEnv>();
}

export function getDriveProviderContext() {
	return getContext<DriveProviderRouterEnv>();
}
