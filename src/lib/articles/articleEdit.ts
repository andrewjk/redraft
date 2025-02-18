import db from "@/data/db";
import { articlesTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export default async function articleEdit(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the article from the database
		const article = await db.query.articlesTable.findFirst({
			where: eq(articlesTable.slug, slug),
		});
		if (!article) {
			return notFound();
		}

		// Create the view
		const view = {
			id: article.id,
			slug: article.slug,
			title: article.title,
			description: article.description,
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
