import db from "@/data/db";
import { commentsTable, postsTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";
import commentPreview from "./commentPreview";

export type CommentCreateModel = {
	post_id: number;
	text: string;
};

export default async function commentCreate(request: Request, username: string, token: string) {
	try {
		const model: CommentCreateModel = await request.json();

		// TODO: This should be the following user
		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		const slug = uuid();

		// Create the comment
		const comment = {
			post_id: model.post_id,
			slug,
			text: model.text,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const newComment = (await db.insert(commentsTable).values(comment).returning())[0];

		// Update the post
		await db
			.update(postsTable)
			.set({
				comment_count: db.$count(commentsTable, eq(commentsTable.post_id, model.post_id)),
				last_comment_at: new Date(),
			})
			.where(eq(postsTable.id, model.post_id));

		// Send an update to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`comments/send`, { post_id: model.post_id }, token);

		// Return
		const view = commentPreview(newComment, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
