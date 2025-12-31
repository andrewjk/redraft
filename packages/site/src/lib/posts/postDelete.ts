import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import postsSend from "../..//api/posts/send/+server";
import database from "../../data/database";
import { activityTable, feedTable, postsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type PostDeleteModel from "../../types/posts/PostDeleteModel";
import * as api from "../api";
import { FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "../constants";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function postDelete(
	request: Request,
	params: Record<string, string>,
	token: string,
	code: string,
) {
	let errorMessage = "";

	try {
		const db = database();

		let model: PostDeleteModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		let postId: number | undefined;
		let postVisibility: number | undefined;

		await transaction(db, async (tx) => {
			try {
				// Set deleted_at to now
				const post = (
					await tx
						.update(postsTable)
						.set({
							deleted_at: new Date(),
						})
						.where(eq(postsTable.slug, model.slug))
						.returning({
							id: postsTable.id,
							slug: postsTable.slug,
							visibility: postsTable.visibility,
						})
				)[0];
				postId = post.id;
				postVisibility = post.visibility;

				// Update it in the feed table too
				await tx
					.update(feedTable)
					.set({
						deleted_at: new Date(),
					})
					.where(eq(feedTable.slug, model.slug));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}posts/${post.slug}`,
					text: `You deleted a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		if (postId !== undefined) {
			if (
				postVisibility === PUBLIC_POST_VISIBILITY ||
				postVisibility === FOLLOWER_POST_VISIBILITY
			) {
				// Delete it from all followers (although we can't guarantee they will do it...)
				// This could take some time, so send it off to be done in an endpoint without awaiting it
				// It has to be done outside of the transaction
				api.post(`posts/send`, postsSend, params, { id: postId }, token);
			}
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
