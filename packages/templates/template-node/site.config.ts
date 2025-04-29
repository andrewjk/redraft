import { node as socialAdapter } from "@redsoc/adapter-node";
import { defineSite } from "@redsoc/site";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import "dotenv/config";

const site: Site = new Site();
site.adapter = node;

await defineSite(site, socialAdapter);

export default site;
