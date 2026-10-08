import { node, siteAdapter } from "@redraft/adapter-node";
import { Site } from "@torpor/build";

const site: Site = new Site();
site.adapter = siteAdapter;

// Add the routes
await site.addRouteFolder("./src/routes");

// Add the API routes, which go under the /api route, and have their own hooks etc
await site.addRouteFolder("./src/api", "/api");

// HACK: Can't call setDatabase from site.config because it's only transformed
// (not bundled), so we're just setting globalThis.socialAdapter and checking
// the db on every call for now
// @ts-ignore
globalThis.socialAdapter = node;

export default site;
