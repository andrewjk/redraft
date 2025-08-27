import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, postsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type PostPinModel = {
	slug: string;
	pinned: boolean;
};

export default async function postPin(request: Request, code: string) {
	let errorMessage: string | undefined;

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

		await transaction(db, async (tx) => {
			try {
				// Update the post
				await tx
					.update(postsTable)
					.set({
						pinned: model.pinned,
					})
					.where(eq(postsTable.slug, model.slug));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}posts/${model.slug}`,
					text: `You ${model.pinned ? "pinned" : "unpinned"} a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
