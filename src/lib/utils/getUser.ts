import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { type User } from "@/data/schema/usersTable";
import { eq } from "drizzle-orm";

export default async function getUser(username: string): Promise<User | undefined> {
	if (!username) {
		return;
	}
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.username, username),
	});
	return user;
}
