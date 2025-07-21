import { notFound, ok, serverError } from "@torpor/build/response";
import database from "../../data/database";
import getErrorMessage from "../utils/getErrorMessage";

export default async function profilePreview() {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst();
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
