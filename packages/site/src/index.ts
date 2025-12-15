import { type Adapter } from "@redraft/adapter-core";
import { Site, type Adapter as SiteAdapter } from "@torpor/build";

export async function defineSite(site: Site, adapter: Adapter, siteAdapter: SiteAdapter) {
	site.adapter = siteAdapter;

	// HACK: To be able to import `.torp` files from barrel files in node_modules,
	// we need to add their libraries to `ssr.noExternal`
	site.viteConfig = {
		ssr: {
			noExternal: ["@torpor/ui"],
		},
	};

	// Add the routes
	await site.addRouteFolder("node_modules/@redraft/site/src/routes");

	// Add the API routes, which go under the /api route, and have their own hooks etc
	await site.addRouteFolder("node_modules/@redraft/site/src/api", "/api");

	// For development. In production it should get built by the adapter
	// @ts-ignore
	globalThis.socialAdapter = adapter;
}
