import torpor from "@torpor/unplugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { type UserConfigFnObject, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	// TODO: Make tsconfigPaths not required
	plugins: [torpor({ test: true }), tsconfigPaths()],
	resolve: {
		conditions: mode === "test" ? ["browser"] : [],
	},
	test: {
		// NOTE: jose doesn't work in jsdom
		environment: "happy-dom",
		globalSetup: "./test/globalSetup.ts",
		// HACK: this is needed to process *.ts routes??
		server: {
			deps: {
				inline: ["@torpor/build", "@torpor/ui"],
			},
		},
	},
})) satisfies UserConfigFnObject as UserConfigFnObject;
