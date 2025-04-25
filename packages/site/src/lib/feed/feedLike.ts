import database from "@/data/database";
import { feedTable, usersTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import { PostLikeModel } from "../public/postLiked";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FeedLikeModel = {
	slug: string;
	authorUrl: string;
	sharedKey: string;
	liked: boolean;
};

export default async function feedLike(request: Request, code: string) {
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
