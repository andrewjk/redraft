import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { notFound, ok } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import accountView from "./accountView";

export default async function accountGet(request: Request, username: string) {
	// Get the user from the database
	const user = await db.query.usersTable.findFirst({ where: eq(usersTable.username, username) });
	if (!user) {
		return notFound();
	}

	// Create post previews
	const view = accountView(user);

	return ok(view);
}
