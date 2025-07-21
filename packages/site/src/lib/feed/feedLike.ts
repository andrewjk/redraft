import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import { postPublic } from "../public";
import { type PostLikedModel } from "../public/postLiked";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FeedLikeModel = {
	slug: string;
	authorUrl: string;
	sharedKey: string;
	liked: boolean;
};

export default async function feedLike(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: FeedLikeModel = await request.json();

				// Get the current user
				const currentUser = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, userIdQuery(code)),
				});
				if (!currentUser) {
					return unauthorized();
				}

				// Update the feed
				await tx
					.update(feedTable)
					.set({
						liked: model.liked,
					})
					.where(eq(feedTable.slug, model.slug));

				// Send the like so the count can be updated
				let sendUrl = `${model.authorUrl}api/public/post/like`;
				let sendData: PostLikedModel = {
					slug: model.slug,
					sharedKey: model.sharedKey,
					liked: model.liked,
				};
				await postPublic(sendUrl, sendData);

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}feed/${model.slug}`,
					text: `You ${model.liked ? "liked" : "unliked"} a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
