import database from "@/data/database";
import { notFound, ok, serverError } from "@torpor/build/response";
import getErrorMessage from "../utils/getErrorMessage";
import profileView from "./profileView";

export default async function profileGet(forEditing = false) {
	try {
		const db = database();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst({
			with: {
				links: true,
			},
		});
		if (!user) {
			return notFound();
		}

		// Create the profile view
		const view = profileView(user);

		if (forEditing && !view.links.length) {
			view.links.push({ id: -1, text: "", url: "" });
		}

		return ok(view);
	} catch (error) {
		console.log(error);
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
