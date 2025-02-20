import db from "@/data/db";
import { articlesTable, postsTable } from "@/data/schema";
import { ARTICLE_POST } from "@/data/schema/postsTable";
import { created, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import postPreview from "./postPreview";

export type PostSaveDraftModel = {
	id: number;
	type: number;
	text: string;
	image: string | null;
	articleId: number | null;
	title: string | null;
	description: string | null;
	articleText: string | null;
};

export default async function postSave(request: Request) {
	try {
		const model: PostSaveDraftModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Create or update the article, if applicable
		if (model.type === ARTICLE_POST) {
			if (!model.articleId && model.articleId !== 0) {
				const article = {
					text: model.articleText!,
					created_at: new Date(),
					updated_at: new Date(),
				};
				model.articleId = (
					await db.insert(articlesTable).values(article).returning({ id: articlesTable.id })
				)[0].id;
			} else {
				const article = {
					text: model.articleText!,
					created_at: new Date(),
					updated_at: new Date(),
				};
				await db.update(articlesTable).set(article).where(eq(articlesTable.id, model.articleId!));
			}
		}

		// Create or update the post
		if (model.id < 0) {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title!) : uuid(),
				type: model.type || 0,
				text: model.text,
				image: model.image,
				articleId: model.articleId,
				title: model.title,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
			};
			const newPost = (await db.insert(postsTable).values(post).returning())[0];

			// Return
			const view = postPreview(newPost, currentUser);
			return created(view);
		} else {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title!) : undefined,
				type: model.type || 0,
				text: model.text,
				image: model.image,
				articleId: model.articleId,
				title: model.title,
				description: model.description,
				updated_at: new Date(),
			};
			const newPost = (
				await db.update(postsTable).set(post).where(eq(postsTable.id, model.id)).returning()
			)[0];

			// Return
			const view = postPreview(newPost, currentUser);
			return ok(view);
		}
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
