import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@nimbus/env/server";
import schema from "@nimbus/db/schema";
import { Pool } from "pg";

const client = new Pool({
	connectionString: env.DATABASE_URL,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
