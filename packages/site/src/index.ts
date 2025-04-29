import { Adapter } from "@redraft/adapter-core";
import { Site } from "@torpor/build";

export async function defineSite(site: Site, adapter: Adapter) {
	await site.addRouteFolder("node_modules/@redraft/site/src/routes");

	// @ts-ignore
	globalThis.socialAdapter = adapter;
}
