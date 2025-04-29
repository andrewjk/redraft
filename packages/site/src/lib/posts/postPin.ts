import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { postsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type PostPinModel = {
	slug: string;
	pinned: boolean;
};

export default async function postPin(request: Request, code: string) {
	try {
		const db = database();

		const model: PostPinModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Update the post
		await db
			.update(postsTable)
			.set({
				pinned: model.pinned,
			})
			.where(eq(postsTable.slug, model.slug));

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
