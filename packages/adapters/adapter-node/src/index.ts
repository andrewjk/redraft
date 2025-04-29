import { type Adapter } from "@redraft/adapter-core";
import database from "./database";

const node: Adapter = {
	database,
};

export { node };
