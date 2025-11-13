import { type UserConfig, defineConfig } from "tsdown";

export default defineConfig({
	// HACK: Need to have a separate adapter-only export to avoid polluting
	// _worker.ts with imports
	entry: ["src/index.ts", "src/adapter.ts"],
}) satisfies UserConfig as UserConfig;
