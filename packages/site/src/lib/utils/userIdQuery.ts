import { eq } from "drizzle-orm";
import database from "../../data/database";
import { userTokensTable, usersTable } from "../../data/schema";

export default function userIdQuery(code: string) {
	const db = database();

	return db
		.select({ id: usersTable.id })
		.from(userTokensTable)
		.innerJoin(usersTable, eq(userTokensTable.user_id, usersTable.id))
		.where(eq(userTokensTable.code, code));
}
