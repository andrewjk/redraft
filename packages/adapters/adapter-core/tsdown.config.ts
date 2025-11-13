import { type UserConfig, defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
}) satisfies UserConfig as UserConfig;
