import { defineConfig } from "drizzle-kit";
import env from "@nimbus/env/server";

if (!env.DATABASE_URL) {
	throw new Error("Missing environment variables. DATABASE_URL is not defined");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
