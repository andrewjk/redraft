import database from "@/data/database";
import { notFound, ok, serverError } from "@torpor/build/response";
import getErrorMessage from "../utils/getErrorMessage";

export default async function profilePreview() {
	try {
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
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
