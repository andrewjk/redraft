import { type Adapter } from "@redraft/adapter-core";
import { Site, type Adapter as SiteAdapter } from "@torpor/build";

export async function defineSite(site: Site, adapter: Adapter, siteAdapter: SiteAdapter) {
	await site.addRouteFolder("node_modules/@redraft/site/src/routes");

	site.adapter = siteAdapter;

	// For development. In production it should get built by the adapter
	// @ts-ignore
	globalThis.socialAdapter = adapter;
}
