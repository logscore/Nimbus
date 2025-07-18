import type { Provider } from "./providers/interface/provider";
import type { Auth, SessionUser } from "@nimbus/auth/auth";
import { Hono, type Context, type Env } from "hono";
import { getContext } from "hono/context-storage";
import type { DB } from "@nimbus/db";

interface publicRouterVars {
	db: DB;
	auth: Auth;
}

interface protectedRouterVars extends publicRouterVars {
	user: SessionUser;
}

interface driveProviderRouterVars extends protectedRouterVars {
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

export type PublicRouterContext = Context<PublicRouterEnv>;
export type ProtectedRouterContext = Context<ProtectedRouterEnv>;
export type DriveProviderRouterContext = Context<DriveProviderRouterEnv>;

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
