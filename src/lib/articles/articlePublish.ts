import db from "@/data/db";
import { articlesTable, feedTable } from "@/data/schema";
import { ARTICLE_POST, postsTable } from "@/data/schema/postsTable";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import getErrorMessage from "../utils/getErrorMessage";
import sluggify from "../utils/sluggify";
import articlePreview from "./articlePreview";

export type ArticlePublishModel = {
	id: number;
	title: string;
	text: string;
	description: string;
};

export default async function articlePublish(request: Request, token: string) {
	try {
		const model: ArticlePublishModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		const slug = sluggify(model.title);

		// Create or update the article
		let newArticle;
		if (model.id < 0) {
			const article = {
				slug,
				title: model.title,
				text: model.text,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
				published_at: new Date(),
			};
			newArticle = (await db.insert(articlesTable).values(article).returning())[0];
		} else {
			const article = {
				slug,
				title: model.title,
				text: model.text,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
				published_at: new Date(),
			};
			newArticle = (
				await db
					.update(articlesTable)
					.set(article)
					.where(eq(articlesTable.id, model.id))
					.returning()
			)[0];
		}

		// Create a post with the article linked
		const postSlug = uuid();
		const post = {
			slug: postSlug,
			type: ARTICLE_POST,
			title: model.title,
			text: model.description,
			url: `${currentUser.url}articles/${slug}`,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const newPostId = (await db.insert(postsTable).values(post).returning({ id: postsTable.id }))[0]
			.id;

		// Set the post id in the article so that we can link back to it for comments etc
		await db
			.update(articlesTable)
			.set({ post_id: newPostId })
			.where(eq(articlesTable.id, newArticle.id));

		// Put it in the feed table as well, so that it shows up in our feed
		const feed = {
			slug: postSlug,
			type: ARTICLE_POST,
			title: model.title,
			text: model.description,
			url: `${currentUser.url}articles/${slug}`,
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(feed);

		// Send it to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`posts/send`, { id: newPostId }, token);

		// Return
		const view = articlePreview(newArticle, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
