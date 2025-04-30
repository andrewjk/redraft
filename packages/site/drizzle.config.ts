import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/data/schema",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DB_CONNECTION!,
	},
}) satisfies Config as Config;
