import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { commentsTable } from "../../data/schema";
import postPreview from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";
import commentPreview from "./commentPreview";

export default async function commentGet(slug: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the user
				const user = await tx.query.usersTable.findFirst();

				// Get the comment from the database
				const comment = await tx.query.commentsTable.findFirst({
					where: eq(commentsTable.slug, slug),
					with: {
						post: {
							with: {
								postTags: {
									with: {
										tag: true,
									},
								},
							},
						},
						user: true,
					},
				});
				if (!comment) {
					return notFound();
				}

				// Get the child comments
				const children = await tx.query.commentsTable.findMany({
					where: eq(commentsTable.parent_id, comment.id),
					with: {
						user: true,
					},
				});

				// Create the view
				//const view = commentPreview(comment, user, children);

				return ok({
					post: postPreview(comment.post, user!),
					comment: commentPreview(comment, user!, children),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
