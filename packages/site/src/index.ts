import { Site } from "@torpor/build";

export async function loadRoutes(site: Site) {
	await site.addRouteFolder("node_modules/@redsoc/site/src/routes");
}
