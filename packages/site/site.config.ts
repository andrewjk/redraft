import { node as adapter } from "@redraft/adapter-node";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";

const site: Site = new Site();
site.adapter = node;

await site.addRouteFolder("./src/routes");

// HACK: Can't call setDatabase from site.config because it's only transformed
// (not bundled), so we're just setting globalThis.adapter and checking the db
// on every call for now
// @ts-ignore
globalThis.adapter = adapter;

export default site;
