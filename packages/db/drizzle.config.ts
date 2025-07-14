import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
	throw new Error("Missing environment variables. DATABASE_URL is not defined");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
