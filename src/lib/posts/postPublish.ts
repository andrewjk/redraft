import db from "@/data/db";
import { feedTable, postsTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postPublish(request: Request, token: string) {
	try {
		const model: PostEditModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
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

		// Send it to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`posts/send`, { id: post.id }, token);

		// Return
		const view = postPreview(post, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
