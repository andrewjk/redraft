import torpor from "@torpor/unplugin/vite";
import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	manifest: {
		permissions: ["storage", "declarativeNetRequest"],
		host_permissions: ["<all_urls>"],
		browser_specific_settings: {
			gecko: {
				id: "{8c300b8b-ffe7-401a-9998-6ee30a9edab5}",
				// @ts-ignore - WXT doesn't support this field yet
				data_collection_permissions: {
					required: ["none"],
				},
			},
		},
	},
	vite: () => ({
		plugins: [torpor()],
	}),
});
