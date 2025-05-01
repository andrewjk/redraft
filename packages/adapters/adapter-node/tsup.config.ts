import { type Options, defineConfig } from "tsup";

type Config =
	| Options
	| Options[]
	| ((overrideOptions: Options) => Options | Options[] | Promise<Options | Options[]>);

export default defineConfig({
	// HACK: Need to have a separate adapter-only export to avoid polluting
	// _worker.ts with imports
	entry: ["src/index.ts", "src/adapter.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	metafile: true,
	sourcemap: true,
}) satisfies Config as Config;
