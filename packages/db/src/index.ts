import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzleProstgresJS } from "drizzle-orm/postgres-js";
import type { Env } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

export const createDb = (env: Env) => {
	if (env.IS_EDGE_RUNTIME) {
		const client = postgres(env.DATABASE_URL, { prepare: false });
		const db = drizzleProstgresJS(client, { schema });
		return {
			db,
			closeDb: async () => {
				await client.end();
			},
		};
	} else {
		// NodeJS connection
		const pool = new Pool({
			connectionString: env.DATABASE_URL,
		});
		const db = drizzleNodePostgres(pool, { schema });
		return {
			db,
			closeDb: async () => {
				// If it is not edge, we do not want to close the connection pool
				// await pool.end();
			},
		};
	}
};

export type DB = ReturnType<typeof createDb>["db"];
