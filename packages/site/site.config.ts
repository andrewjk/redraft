import { node as socialAdapter } from "@redraft/adapter-node";
import { node as siteAdapter } from "@torpor/adapter-node";
import { Site } from "@torpor/build";

const site: Site = new Site();
site.adapter = siteAdapter;

await site.addRouteFolder("./src/routes");

// HACK: Can't call setDatabase from site.config because it's only transformed
// (not bundled), so we're just setting globalThis.socialAdapter and checking
// the db on every call for now
// @ts-ignore
globalThis.socialAdapter = socialAdapter;

export default site;
