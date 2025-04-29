import { type Adapter } from "@redsoc/adapter-core";
import database from "./database";

const cloudflare: Adapter = {
	database,
};

export { cloudflare };
