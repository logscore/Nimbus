import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import type { CreateEnv } from "@nimbus/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

export const createDb = (env: CreateEnv) => {
	if (env.IS_EDGE_RUNTIME) {
		const client = postgres(env.DATABASE_URL, { prepare: false });
		const db = drizzle(client, { schema });

		return {
			db,
			closeDb: async () => {
				await client.end();
			},
		};
	}

	// NodeJS connection
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
	});
	const db = drizzleNode(pool, { schema });

	return {
		db,
		closeDb: async () => {
			// If it is not edge, we do not want to close the connection pool
			// await pool.end();
		},
	};
};

export type DB = ReturnType<typeof createDb>["db"];
