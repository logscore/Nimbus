import type { Auth, SessionUser } from "@nimbus/auth/auth";
import type { DB } from "@nimbus/db";

export interface HonoVars {
	user?: SessionUser;
	db: DB;
	auth: Auth;
}

export type HonoContext = { Variables: HonoVars };
