import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { postsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postPreview from "./postPreview";

export default async function postPreviewGet(slug: string, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the post from the database
		const postQuery = db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
			},
		});

		const [currentUser, post] = await Promise.all([currentUserQuery, postQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!post) {
			return notFound();
		}

		// Create the view
		const view = postPreview(post, currentUser);

		return ok({ post: view });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
