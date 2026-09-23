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
		// Components are compiled for SSR by default (the `test` option).
		// Interactive tests use `?client` / `?server` import queries to get
		// a component compiled for the client (so it can be mounted or
		// hydrated) or for the server (so it can render HTML to hydrate)
		// HACK: this is needed to process *.ts routes??
		server: {
			deps: {
				inline: ["@torpor/build", "@torpor/ui", "phosphor-torpor"],
			},
		},
	},
}) satisfies ViteUserConfig as ViteUserConfig;
