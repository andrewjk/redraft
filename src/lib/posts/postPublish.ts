import db from "@/data/db";
import { feedTable, postsTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postPublish(request: Request, token: string) {
	try {
		const model: PostEditModel = await request.json();

		// Can't publish if it's already been published
		// TODO: Maybe we should allow this, for updating the feed in followers' tables...
		const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, model.id) });
		if (post?.published_at) {
			return unprocessable();
		}

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		const result = await postCreateOrUpdate(model);

		// Put it in the feed table as well, so that it shows up in our feed
		const feed = {
			slug: result.post.slug,
			text: model.text,
			type: model.type,
			image: model.image,
			url: model.url,
			title: model.title,
			publication: model.publication,
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(feed);

		// Send it to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`posts/send`, { id: result.post.id }, token);

		// Return
		const view = postPreview(result.post, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
