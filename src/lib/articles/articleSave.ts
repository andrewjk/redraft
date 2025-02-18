import db from "@/data/db";
import { articlesTable } from "@/data/schema";
import { created, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import sluggify from "../utils/sluggify";
import articlePreview from "./articlePreview";

export type ArticleSaveDraftModel = {
	id: number;
	title: string;
	text: string;
	description: string;
};

export default async function articleSave(request: Request) {
	console.log("HERE!");
	try {
		const model: ArticleSaveDraftModel = await request.json();
		console.log(model);
		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		const slug = sluggify(model.title);

		// Create or update the article
		if (model.id < 0) {
			const article = {
				slug,
				title: model.title,
				text: model.text,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
			};
			console.log(article);
			const newArticle = (await db.insert(articlesTable).values(article).returning())[0];

			// Return
			const view = articlePreview(newArticle, currentUser);
			return created(view);
		} else {
			const article = {
				slug,
				title: model.title,
				text: model.text,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
			};
			const newArticle = (
				await db
					.update(articlesTable)
					.set(article)
					.where(eq(articlesTable.id, model.id))
					.returning()
			)[0];

			// Return
			const view = articlePreview(newArticle, currentUser);
			return ok(view);
		}
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
