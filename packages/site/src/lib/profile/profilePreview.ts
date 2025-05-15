import { notFound, ok, serverError } from "@torpor/build/response";
import database from "../../data/database";
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
			bio: user.bio,
			location: user.location,
			image: user.image,
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
