import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { created, serverError, unauthorized } from "@torpor/build/response";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";
import postPreview from "./postPreview";

export type PostCreateModel = {
	text: string;
};

export default async function postCreate(request: Request, username: string) {
	try {
		const model: PostCreateModel = await request.json();

		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		// Create the post
		const post = {
			text: model.text,
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the post into the database
		const newPost = (await db.insert(postsTable).values(post).returning())[0];

		// Return
		const view = postPreview(newPost, currentUser);
		return created(view);
	} catch (error) {
		console.log(error);
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
