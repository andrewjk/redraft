import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import { PostReactionModel } from "../public/postReaction";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FeedReactModel = {
	slug: string;
	authorUrl: string;
	sharedKey: string;
	emoji: string;
};

export default async function feedReact(request: Request, code: string) {
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

		// Update the feed
		await db
			.update(feedTable)
			.set({
				emoji: model.emoji,
			})
			.where(eq(feedTable.slug, model.slug));

		// Send the like so the count can be updated
		let sendUrl = `${model.authorUrl}api/public/post/react`;
		let sendData: PostReactionModel = {
			slug: model.slug,
			sharedKey: model.sharedKey,
			emoji: model.emoji,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
