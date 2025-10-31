import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type PostEditModel from "../../types/posts/PostEditModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postCreateOrUpdate from "./postCreateOrUpdate";

export default async function postSave(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: PostEditModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		await transaction(db, async (tx) => {
			try {
				const { post } = await postCreateOrUpdate(tx, model);

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}posts/${post.slug}`,
					text: `You saved a post`,
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
