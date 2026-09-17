import { defineConfig, type ViteUserConfig } from "vite-plus";

export default defineConfig({
	test: {
		projects: ["packages/site"],
	},
}) satisfies ViteUserConfig as ViteUserConfig;
