import { type Config, defineConfig } from "drizzle-kit";

const config: Config = defineConfig({
	out: "./drizzle",
	schema: "./src/data/schema",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DB_CONNECTION!,
	},
});

export default config;
