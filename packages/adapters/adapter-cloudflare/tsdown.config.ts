import { type UserConfig, defineConfig } from "tsdown";

export default defineConfig({
	// HACK: Need to have a separate adapter-only export to avoid polluting
	// _worker.ts with imports
	entry: ["src/index.ts", "src/adapter.ts"],
	copy: [
		"src/adapter.global.js",
		{
			from: "src/adapter.global.js",
			to: "dist/adapter.global.js",
		},
	],
}) satisfies UserConfig as UserConfig;
