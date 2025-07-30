import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePostgresJS } from "drizzle-orm/postgres-js";
import type { Env } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

type DrizzlePostgresInstance<S extends Record<string, unknown>> =
	| ReturnType<typeof drizzleNodePostgres<S>>
	| ReturnType<typeof drizzlePostgresJS<S>>;

export type DB = DrizzlePostgresInstance<typeof schema>;

interface DatabaseClientData {
	db: DB;
	closeDb: () => Promise<void>;
}

// Postgres.js is the default for development so we know if we break something...
export function createDb(env: Env): DatabaseClientData {
	if (env.IS_EDGE_RUNTIME || env.NODE_ENV === "development") {
		// Edge runtime connection
		const client = postgres(env.DATABASE_URL, { prepare: false });
		const db = drizzlePostgresJS(client, { schema });

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
