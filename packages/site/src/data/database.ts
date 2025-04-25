import env from "@/lib/env";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/index";

const db = drizzle(env().DB_CONNECTION!, { schema });

export default function database() {
	return db;
}
