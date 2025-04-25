import { loadRoutes } from "@redsoc/site";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";

const site: Site = new Site();
site.adapter = node;

await loadRoutes(site);

export default site;
