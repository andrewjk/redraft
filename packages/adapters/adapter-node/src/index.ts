import { type Adapter } from "@redsoc/adapter-core";
import database from "./database";

const node: Adapter = {
	database,
};

export { node };
