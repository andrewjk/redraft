import db from "@/data/db";
import { notFound, ok } from "@torpor/build/response";

export default async function profilePreview() {
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
	};

	return ok(view);
}
