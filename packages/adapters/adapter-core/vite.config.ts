import { defineConfig, type UserConfig } from "vite-plus";

export default defineConfig({
	pack: {
		deps: { resolveDepSubpath: true },
		entry: ["src/index.ts"],
	},
}) satisfies UserConfig as UserConfig;
