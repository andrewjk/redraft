import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "src/data/schema",
	out: "src/data/migrations",
	dbCredentials: {
		url: process.env.DB_CONNECTION!,
	},
}) satisfies Config as Config;
