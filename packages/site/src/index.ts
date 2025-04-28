import { Adapter } from "@redsoc/adapter-core";
import { Site } from "@torpor/build";
import { setDatabase } from "./data/database";

export async function defineSite(site: Site, adapter: Adapter) {
	await site.addRouteFolder("node_modules/@redsoc/site/src/routes");
	setDatabase(adapter);
}
