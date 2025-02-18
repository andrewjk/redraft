import db from "@/data/db";
import { articlesTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export default async function articleGet(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the article from the database
		const article = await db.query.articlesTable.findFirst({
			where: eq(articlesTable.slug, slug),
			// TODO: Comments from the linked post -- or maybe load them when scrolled to
		});
		if (!article) {
			return notFound();
		}

		// Create the view
		const view = {
			slug: article.slug,
			title: article.title,
			text: article.text,
			author: {
				image: user.image,
				name: user.name,
				url: user.url,
			},
			createdAt: article.created_at,
			updatedAt: article.updated_at,
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
