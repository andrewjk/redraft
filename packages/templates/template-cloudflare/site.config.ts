import { cloudflare as socialAdapter } from "@redraft/adapter-cloudflare";
import { defineSite } from "@redraft/site";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import "dotenv/config";

const site: Site = new Site();
site.adapter = node;

await defineSite(site, socialAdapter);

export default site;
