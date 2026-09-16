import { defineConfig, type UserConfig } from "vite-plus";

export default defineConfig({
	pack: {
		deps: { resolveDepSubpath: true },
		// HACK: Need to have a separate adapter-only export to avoid polluting
		// _worker.ts with imports
		entry: ["src/index.ts", "src/adapter.ts"],
	},
}) satisfies UserConfig as UserConfig;
