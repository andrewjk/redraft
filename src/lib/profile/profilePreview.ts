import database from "@/data/database";
import { notFound, ok } from "@torpor/build/response";

export default async function profilePreview() {
	const db = database();

	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();
	if (!user) {
		return notFound();
	}

	const view = {
		url: user.url,
		name: user.name,
		image: user.image,
		bio: user.bio,
		location: user.location,
	};

	return ok(view);
}
