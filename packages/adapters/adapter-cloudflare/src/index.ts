import { type Adapter } from "@redraft/adapter-core";
import database from "./database";

const cloudflare: Adapter = {
	database,
};

export { cloudflare };
