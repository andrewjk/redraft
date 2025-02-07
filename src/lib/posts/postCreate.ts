import db from "@/data/db";
import { postsTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { v4 as uuid } from "uuid";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";
import postPreview from "./postPreview";

export type PostCreateModel = {
	text: string;
};

export default async function postCreate(request: Request, username: string, token: string) {
	try {
		const model: PostCreateModel = await request.json();

		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		// Create the post
		const post = {
			slug: uuid(),
			text: model.text,
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the post into the database
		const newPost = (await db.insert(postsTable).values(post).returning())[0];

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
