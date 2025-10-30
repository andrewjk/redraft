import { type Options, defineConfig } from "tsup";

type Config =
	| Options
	| Options[]
	| ((overrideOptions: Options) => Options | Options[] | Promise<Options | Options[]>);

export default defineConfig({
	entry: ["src/index.ts"],
	format: "esm",
	dts: true,
	clean: true,
	metafile: true,
	sourcemap: true,
}) satisfies Config as Config;
