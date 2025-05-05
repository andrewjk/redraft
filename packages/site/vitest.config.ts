import torpor from "@torpor/unplugin/vite";
import { type UserConfigFnObject, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	plugins: [torpor()],
	resolve: {
		conditions: mode === "test" ? ["browser"] : [],
	},
	test: {
		// NOTE: jose doesn't work in jsdom
		environment: "happy-dom",
		globalSetup: "./test/globalSetup.ts",
	},
})) satisfies UserConfigFnObject as UserConfigFnObject;
