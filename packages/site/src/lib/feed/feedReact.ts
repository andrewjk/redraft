import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import transaction from "../../data/transaction";
import type FeedReactModel from "../../types/feed/FeedReactModel";
import { POST_REACTION_VERSION } from "../../types/public/PostReactionModel";
import type PostReactionModel from "../../types/public/PostReactionModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function feedReact(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FeedReactModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		await transaction(db, async (tx) => {
			try {
				// Update the feed
				await tx
					.update(feedTable)
					.set({
						emoji: model.emoji,
					})
					.where(eq(feedTable.slug, model.slug));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}feed/${model.slug}`,
					text: `You reacted to a post with ${model.emoji}`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send the like so the count can be updated
		let sendUrl = `${model.authorUrl}api/public/post/react`;
		let sendData: PostReactionModel = {
			slug: model.slug,
			sharedKey: model.sharedKey,
			emoji: model.emoji,
			version: POST_REACTION_VERSION,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
