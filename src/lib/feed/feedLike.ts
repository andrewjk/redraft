import database from "@/data/database";
import { feedTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import { PostLikeModel } from "../public/postLiked";
import getErrorMessage from "../utils/getErrorMessage";

export type FeedLikeModel = {
	slug: string;
	authorUrl: string;
	sharedKey: string;
	liked: boolean;
};

export default async function feedLike(request: Request) {
	const db = database();

	try {
		const model: FeedLikeModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Update the feed
		await db
			.update(feedTable)
			.set({
				liked: model.liked,
			})
			.where(eq(feedTable.slug, model.slug));

		// Send the like so the count can be updated
		let sendUrl = `${model.authorUrl}api/public/post/like`;
		let sendData: PostLikeModel = {
			slug: model.slug,
			sharedKey: model.sharedKey,
			liked: model.liked,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
