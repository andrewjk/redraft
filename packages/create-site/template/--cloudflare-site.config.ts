import { cloudflare, siteAdapter } from "@redraft/adapter-cloudflare";
import { defineSite } from "@redraft/site";
import { Site } from "@torpor/build";
import "dotenv/config";

const site: Site = new Site();

await defineSite(site, cloudflare, siteAdapter);

export default site;
