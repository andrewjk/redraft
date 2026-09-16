import { defineConfig, type UserConfig } from "vite-plus";

export default defineConfig({
	pack: {
		deps: {
			resolveDepSubpath: true,
			// Keep dependencies external (the emitted d.ts references types
			// from @torpor/build and drizzle-orm, which are dependencies of
			// the published package). Bundling them would pull in vite's type
			// graph (postcss, esbuild, lightningcss), which
			// rolldown-plugin-dts can't bundle
			neverBundle: true,
		},
		entry: ["src/index.ts", "src/data/schema"],
	},
}) satisfies UserConfig as UserConfig;
