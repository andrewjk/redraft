import { notFound, ok, serverError } from "@torpor/build/response";
import database from "../../data/database";
import getErrorMessage from "../utils/getErrorMessage";
import profileView from "./profileView";

export default async function profileGet(forEditing = false) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst({
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

				return ok({ profile: view });
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
