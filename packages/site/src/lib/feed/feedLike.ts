import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import transaction from "../../data/transaction";
import type FeedLikeModel from "../../types/feed/FeedLikeModel";
import { POST_LIKED_VERSION } from "../../types/public/PostLikedModel";
import type PostLikedModel from "../../types/public/PostLikedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function feedLike(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FeedLikeModel = await request.json();

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
						liked: model.liked,
					})
					.where(eq(feedTable.slug, model.slug));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}feed/${model.slug}`,
					text: `You ${model.liked ? "liked" : "unliked"} a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send the like so the count can be updated
		let sendUrl = `${model.authorUrl}api/public/post/like`;
		let sendData: PostLikedModel = {
			slug: model.slug,
			sharedKey: model.sharedKey,
			liked: model.liked,
			version: POST_LIKED_VERSION,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
