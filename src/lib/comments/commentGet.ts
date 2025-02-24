import db from "@/data/db";
import { commentsTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import postPreview from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";
import commentPreview from "./commentPreview";

export default async function commentGet(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the comment from the database
		const comment = await db.query.commentsTable.findFirst({
			where: eq(commentsTable.slug, slug),
			with: {
				post: true,
				user: true,
			},
		});
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

		// Create the view
		//const view = commentPreview(comment, user, children);

		return ok({
			post: postPreview(comment.post, user),
			comment: commentPreview(comment, user, children),
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
