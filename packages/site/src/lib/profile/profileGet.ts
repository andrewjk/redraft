import { notFound, ok, serverError } from "@torpor/build/response";
import database from "../../data/database";
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
		const view = profileView(user, forEditing);

		if (forEditing && !view.links.length) {
			view.links.push({ id: -1, text: "", url: "" });
		}

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
