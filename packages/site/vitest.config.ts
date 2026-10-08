import torpor from "@torpor/unplugin/vite";
import { defineConfig, type ViteUserConfig } from "vite-plus";

// Server-rendering tests (pages via `runTest`, or components called as SSR
// functions) live in `*-ssr.test.ts` and run in a DOM-shimmed SSR environment
// (see test/ssr-dom-env.ts). Everything else mounts components client-side.
const ssrTests = "test/**/*-ssr.test.ts";

const server = {
	deps: {
		inline: ["@torpor/build", "@torpor/ui", "phosphor-torpor"],
	},
};

export default defineConfig({
	test: {
		projects: [
			{
				extends: false,
				plugins: [torpor()],
				resolve: { conditions: ["browser"] },
				test: {
					name: "ssr",
					environment: "./test/ssr-dom-env.ts",
					globalSetup: "./test/globalSetup.ts",
					include: [ssrTests],
					server,
				},
			},
			{
				extends: false,
				plugins: [torpor()],
				resolve: { conditions: ["browser"] },
				test: {
					name: "client",
					environment: "happy-dom",
					include: ["test/**/*.test.ts"],
					exclude: [ssrTests],
					server,
				},
			},
		],
	},
}) satisfies ViteUserConfig as ViteUserConfig;
