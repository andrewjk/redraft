import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "node_modules/@redraft/site/src/data/schema",
	out: "node_modules/@redraft/site/src/data/migrations",
	dbCredentials: {
		url: process.env.DB_CONNECTION!,
	},
}) satisfies Config as Config;
