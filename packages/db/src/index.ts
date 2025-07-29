import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzleProstgresJS } from "drizzle-orm/postgres-js";
import type { Env } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

type DrizzlePostgresInstance<S extends Record<string, unknown>> =
	| ReturnType<typeof drizzleNodePostgres<S>>
	| ReturnType<typeof drizzleProstgresJS<S>>;

export type DB = DrizzlePostgresInstance<typeof schema>;

interface DatabaseClientData {
	db: DB;
	closeDb: () => Promise<void>;
}

export function createDb(env: Env): DatabaseClientData {
	if (env.IS_EDGE_RUNTIME) {
		// Edge runtime connection
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
				await pool.end();
			},
		};
	}
}
