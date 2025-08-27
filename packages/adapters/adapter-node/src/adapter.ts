import { type Adapter } from "@redraft/adapter-core";
import database from "./database";
import images from "./images";
import storage from "./storage";
import transaction from "./transaction";

export default {
	database,
	transaction,
	storage,
	images,
} satisfies Adapter as Adapter;
