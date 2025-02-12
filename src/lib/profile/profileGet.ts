import db from "@/data/db";
import { notFound, ok } from "@torpor/build/response";
import profileView from "./profileView";

export default async function profileGet() {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();
	if (!user) {
		return notFound();
	}

	// Create post previews
	const view = profileView(user);

	return ok(view);
}
