import type { Auth, SessionUser } from "@nimbus/auth/auth";
import { Hono, type Context, type Env } from "hono";
import { getContext } from "hono/context-storage";
import type { DB } from "@nimbus/db";

interface publicRouterVars {
	db: DB;
}

interface protectedRouterVars extends publicRouterVars {
	user: SessionUser;
	auth: Auth;
}

export interface PublicRouterEnv {
	Variables: publicRouterVars;
}

export interface ProtectedRouterEnv {
	Variables: protectedRouterVars;
}

export type PublicRouterContext = Context<PublicRouterEnv>;
export type ProtectedRouterContext = Context<ProtectedRouterEnv>;

function createHono<T extends Env>() {
	return new Hono<T>();
}

export function createPublicRouter() {
	return createHono<PublicRouterEnv>();
}

export function createProtectedRouter() {
	return createHono<ProtectedRouterEnv>();
}

export function getPublicContext() {
	return getContext<PublicRouterEnv>();
}

export function getProtectedContext() {
	return getContext<ProtectedRouterEnv>();
}

export function getSessionUserFromContext(c: Context<ProtectedRouterEnv>) {
	return c.get("user");
}
