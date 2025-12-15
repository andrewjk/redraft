import { node, siteAdapter } from "@redraft/adapter-node";
import { defineSite } from "@redraft/site";
import { Site } from "@torpor/build";
import "dotenv/config";

const site: Site = new Site();

await defineSite(site, node, siteAdapter);

export default site;
