import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export default async function postGet(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the post from the database
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
		});
		if (!post) {
			return notFound();
		}

		// Create the view
		const view = {
			slug: post.slug,
			text: post.text,
			author: {
				image: user.image,
				username: user.username,
				url: process.env.SITE_LOCATION!,
			},
			createdAt: post.created_at,
			updatedAt: post.updated_at,
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
