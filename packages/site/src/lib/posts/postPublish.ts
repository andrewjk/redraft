import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, postsTable, usersTable } from "../../data/schema";
import postsSend from "../../routes/api/posts/send/+server";
import * as api from "../api";
import { FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "../constants";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { type PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postPublish(
	request: Request,
	params: Record<string, string>,
	token: string,
	code: string,
) {
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

		const { post } = await postCreateOrUpdate(model);

		// Set the new publish dates
		if (post.published_at) {
			post.republished_at = new Date();
		} else {
			post.published_at = new Date();
		}
		await db
			.update(postsTable)
			.set({
				published_at: post.published_at,
				republished_at: post.republished_at,
			})
			.where(eq(postsTable.id, post.id));

		// Put it in the feed table as well, so that it shows up in our feed
		const feed = await db.query.feedTable.findFirst({ where: eq(feedTable.slug, post.slug) });
		const record = {
			slug: post.slug,
			text: model.text,
			visibility: model.visibility,
			type: model.type,
			image: model.image,
			url: model.url,
			title: model.title,
			publication: model.publication,
			published_at: post.published_at,
			republished_at: post.republished_at,
			created_at: feed?.created_at ?? new Date(),
			updated_at: new Date(),
		};
		if (feed) {
			await db.update(feedTable).set(record).where(eq(feedTable.id, feed.id));
		} else {
			await db.insert(feedTable).values(record);
		}

		if (
			post.visibility === PUBLIC_POST_VISIBILITY ||
			post.visibility === FOLLOWER_POST_VISIBILITY
		) {
			// Send it to all followers
			// This could take some time, so send it off to be done in an endpoint without awaiting it
			api.post(`posts/send`, postsSend, params, { id: post.id }, token);
		}

		// Return
		const view = postPreview(post, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
