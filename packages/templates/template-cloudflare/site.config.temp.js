import { cloudflare as socialAdapter } from "@redsoc/adapter-cloudflare";
import { defineSite } from "@redsoc/site";
import { node } from "@torpor/adapter-node";
import { Site } from "@torpor/build";
import "dotenv/config";
const site = new Site();
site.adapter = node;
await defineSite(site, socialAdapter);
export default site;
