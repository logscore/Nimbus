import type { Provider } from "./providers/interface/provider";
import type { auth, Auth } from "@nimbus/auth/auth";
import type { CacheClient } from "@nimbus/cache";
import type { DB } from "@nimbus/db";

export interface HonoContext {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
		db: DB;
		cache: CacheClient;
		auth: Auth;
		provider: Provider;
	};
}
