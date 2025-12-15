import { type UserConfig, defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/data/schema"],
}) satisfies UserConfig as UserConfig;
