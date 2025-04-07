import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/index";

const db = drizzle(process.env.DB_CONNECTION!, { schema });

export default db;
