import { node as socialAdapter } from "@redraft/adapter-node";
import { defineSite } from "@redraft/site";
import { node as siteAdapter } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import "dotenv/config";

const site: Site = new Site();
site.adapter = siteAdapter;

await defineSite(site, socialAdapter);

export default site;
