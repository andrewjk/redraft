import torpor from "@torpor/unplugin/vite";
import { defineConfig, type ViteUserConfig } from "vite-plus";

export default defineConfig({
	plugins: [torpor({ test: true })],
	resolve: {
		conditions: ["browser"],
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
}) satisfies ViteUserConfig as ViteUserConfig;
