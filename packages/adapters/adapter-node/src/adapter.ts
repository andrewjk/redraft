import { type Adapter } from "@redraft/adapter-core";
import database from "./database";
import images from "./images";
import storage from "./storage";

export default {
	database,
	storage,
	images,
} satisfies Adapter as Adapter;
