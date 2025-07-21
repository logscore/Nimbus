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

interface PublicRouterEnv {
	Variables: publicRouterVars;
}

interface ProtectedRouterEnv {
	Variables: protectedRouterVars;
}

interface DriveProviderRouterEnv {
	Variables: driveProviderRouterVars;
}

type PublicRouterContext = Context<PublicRouterEnv>;
type ProtectedRouterContext = Context<ProtectedRouterEnv>;
type DriveProviderRouterContext = Context<DriveProviderRouterEnv>;

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
