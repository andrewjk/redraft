import fs from "node:fs";
import path from "node:path";

const adapterFileIn = path.resolve("./dist/iife.iife.js");
const adapterCode = fs
	.readFileSync(adapterFileIn, "utf-8")
	.replaceAll(/^[ ]+\/\/ (..\/)+node_modules\/.+\n/gm, "");
const adapterFileOut = path.resolve("./src/adapter.global.js");
fs.writeFileSync(adapterFileOut, adapterCode);
