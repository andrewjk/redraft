import { defineConfig, type UserConfig } from "vite-plus";

export default defineConfig({
	pack: {
		deps: { resolveDepSubpath: true },
		entry: ["src/index.ts", "src/data/schema"],
	},
}) satisfies UserConfig as UserConfig;
