import { type UserConfig, defineConfig } from "wxt";

const config: UserConfig = defineConfig({
	srcDir: "src",
	manifest: {
		permissions: ["storage", "declarativeNetRequest"],
		host_permissions: ["<all_urls>"],
	},
});

export default config;
