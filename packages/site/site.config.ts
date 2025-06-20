import { node, siteAdapter } from "@redraft/adapter-node";
import { Site } from "@torpor/build";

const site: Site = new Site();
site.adapter = siteAdapter;

// HACK: To be able to import `.torp` files from barrel files in node_modules,
// we need to add their libraries to `ssr.noExternal`
site.viteConfig = {
	ssr: {
		noExternal: ["@torpor/ui"],
	},
};

await site.addRouteFolder("./src/routes");

// HACK: Can't call setDatabase from site.config because it's only transformed
// (not bundled), so we're just setting globalThis.socialAdapter and checking
// the db on every call for now
// @ts-ignore
globalThis.socialAdapter = node;

export default site;
