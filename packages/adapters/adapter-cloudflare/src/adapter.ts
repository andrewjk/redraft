import { type Adapter } from "@redraft/adapter-core";
import database from "./database";

export default {
	database,
} satisfies Adapter as Adapter;
