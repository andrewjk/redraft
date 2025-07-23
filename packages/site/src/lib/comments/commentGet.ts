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

		// Get the user
		const userQuery = db.query.usersTable.findFirst();

		// Get the comment from the database
		const commentQuery = db.query.commentsTable.findFirst({
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

		const [user, comment] = await Promise.all([userQuery, commentQuery]);
		if (!comment) {
			return notFound();
		}

		// Get the child comments
		const children = await db.query.commentsTable.findMany({
			where: eq(commentsTable.parent_id, comment.id),
			with: {
				user: true,
			},
		});

		return ok({
			post: postPreview(comment.post, user!),
			comment: commentPreview(comment, user!, children),
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
