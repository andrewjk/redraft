import db from "@/data/db";
import { notFound, ok } from "@torpor/build/response";
import accountView from "./accountView";

export default async function accountGet() {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();
	if (!user) {
		return notFound();
	}

	// Create post previews
	const view = accountView(user);

	return ok(view);
}
