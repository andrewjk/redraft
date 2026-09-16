import { ok, serverError, unauthorized, notFound } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable, usersTable } from "../../data/schema";
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

		// Get the current user, and the author's relationship, so that the
		// shared key never has to come from the browser
		const [currentUser, following] = await Promise.all([
			db.query.usersTable.findFirst({
				where: eq(usersTable.id, userIdQuery(code)),
			}),
			db.query.followingTable.findFirst({
				where: and(eq(followingTable.url, model.authorUrl), isNull(followingTable.deleted_at)),
			}),
		]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!following) {
			return notFound();
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
			sharedKey: following.shared_key,
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
