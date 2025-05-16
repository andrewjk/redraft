import { type Adapter } from "@redraft/adapter-core";
import database from "./database";
import storage from "./storage";

export default {
	database,
	storage,
} satisfies Adapter as Adapter;
