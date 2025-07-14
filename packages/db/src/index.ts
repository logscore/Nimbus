import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { isEdge } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import postgres from "postgres";
import { Pool } from "pg";

export const createDb = (url: string) => {
	const db = isEdge
		? drizzle(
				// Serverless connection. Supabase doesnt support prepare statements
				postgres(url, { prepare: false }),
				{ schema }
			)
		: drizzleNode(
				// NodeJS connection
				new Pool({
					connectionString: url,
				}),
				{ schema }
			);

	return db;
};

export type DB = ReturnType<typeof createDb>;
