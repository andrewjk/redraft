import { type Options, defineConfig } from "tsup";

type Config =
	| Options
	| Options[]
	| ((overrideOptions: Options) => Options | Options[] | Promise<Options | Options[]>);

const config: Config = defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	metafile: true,
	sourcemap: true,
});

export default config;
