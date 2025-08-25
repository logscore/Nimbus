import type { auth, Auth, SessionUser } from "@nimbus/auth/auth";
import type { Provider } from "./providers/interface/provider";
import { getContext } from "hono/context-storage";
import type { CacheClient } from "@nimbus/cache";
import { Hono, type Env as HonoEnv } from "hono";
import type { DB } from "@nimbus/db";

export interface BaseRouterVars {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
	db: DB;
	cache: CacheClient;
	auth: Auth;
}

export interface HonoContext {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
	db: DB;
	cache: CacheClient;
	auth: Auth;
	provider: Provider;
}

export interface ProtectedRouterVars extends BaseRouterVars {
	user: SessionUser;
}

export interface DriveProviderRouterVars extends ProtectedRouterVars {
	provider: Provider;
}

export interface PublicRouterEnv {
	Variables: BaseRouterVars;
}

export interface ProtectedRouterEnv {
	Variables: ProtectedRouterVars;
}

export interface DriveProviderRouterEnv {
	Variables: DriveProviderRouterVars;
}

function createHono<T extends HonoEnv>() {
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
