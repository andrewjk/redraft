import db from "@/data/db";
import { feedTable, postsTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { v4 as uuid } from "uuid";
import getErrorMessage from "../utils/getErrorMessage";
import postPreview from "./postPreview";

export type PostCreateModel = {
	text: string;
};

export default async function postCreate(request: Request, token: string) {
	try {
		const model: PostCreateModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		const slug = uuid();

		// Create the post
		const post = {
			slug,
			text: model.text,
			pinned: false,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const newPost = (await db.insert(postsTable).values(post).returning())[0];

		// Put it in the feed table as well, so that it shows up in our feed
		const feed = {
			slug,
			text: model.text,
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(feed);

		// Send it to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`posts/send`, { id: newPost.id }, token);

		// Return
		const view = postPreview(newPost, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
