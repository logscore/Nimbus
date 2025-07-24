import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { isEdge } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

export const createDb = (url: string) => {
	if (isEdge) {
		const client = postgres(url, { prepare: false });
		const db = drizzle(client, { schema });

		return {
			db,
			cleanup: async () => {
				await client.end();
			},
		};
	}

	// NodeJS connection
	const pool = new Pool({
		connectionString: url,
	});
	const db = drizzleNode(pool, { schema });

	return {
		db,
		cleanup: async () => {
			//   If it is not edge, we do not want to close the connection pool
			//   await pool.end();
		},
	};
};

export type DB = ReturnType<typeof createDb>["db"];
