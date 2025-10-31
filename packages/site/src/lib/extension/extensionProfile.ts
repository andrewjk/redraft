import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function extensionProfile(code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current user
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!user) {
			return unauthorized();
		}

		return ok({
			url: user.url,
			email: user.email,
			name: user.name,
			bio: user.bio,
			location: user.location,
			image: user.image,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
