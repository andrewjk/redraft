import torpor from "@torpor/unplugin/vite";
import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	manifest: {
		permissions: ["storage", "declarativeNetRequest"],
		host_permissions: ["<all_urls>"],
	},
	vite: () => ({
		plugins: [torpor()],
	}),
});
