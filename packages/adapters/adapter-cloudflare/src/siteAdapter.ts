import { cloudflare } from "@torpor/adapter-cloudflare";
import { type Adapter, Site } from "@torpor/build";
import fs from "node:fs";
import path from "node:path";

export default {
	prebuild,
	postbuild,
	serve: cloudflare.serve,
} satisfies Adapter as Adapter;

async function prebuild(site: Site) {
	// HACK: This doesn't work. In standalone projects the code doesn't get
	// the imports and exports transformed. Just going to copy the code in

	/*
	// For production, we need to set the adapter in _worker.ts so it's
	// accessible from server functions
	const code = `
import adapter from "@redraft/adapter-cloudflare/adapter";
globalThis.socialAdapter = adapter;
`.trimStart();
	const distFolder = path.resolve(site.root, "./dist");
	const file = path.resolve(site.root, "./dist/adapter.server.ts");
	if (!fs.existsSync(distFolder)) {
		fs.mkdirSync(distFolder);
	}
	fs.writeFileSync(file, code);

	// Get the site to build this file
	site.inputs = [file];
	*/
	if (cloudflare.prebuild) {
		await cloudflare.prebuild(site);
	}
}

async function postbuild(site: Site) {
	if (cloudflare.postbuild) {
		await cloudflare.postbuild(site);
	}

	// Copy the file into _worker.js as an IIFE
	//const adapterFile = path.resolve(site.root, "./dist/cloudflare/adapter.server.js");
	const adapterFile = path.resolve(
		site.root,
		"./node_modules/@redraft/adapter-cloudflare/src/adapter.global.js",
	);
	const adapterCode = fs.readFileSync(adapterFile, "utf-8");

	const workerFile = path.resolve(site.root, "./dist/cloudflare/_worker.js");
	let workerCode = fs.readFileSync(workerFile, "utf-8");
	workerCode += "\n" + adapterCode;

	fs.writeFileSync(workerFile, workerCode);
}
