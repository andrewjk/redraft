import db from "@/data/db";
import { articlesTable, feedTable, postsTable } from "@/data/schema";
import { ARTICLE_POST } from "@/data/schema/postsTable";
import * as api from "@/lib/api";
import { created, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import { PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postPublish(request: Request, token: string) {
	try {
		const model: PostEditModel = await request.json();

		// Can't publish if it's already been published
		// TODO: Maybe we should allow this, for updating the feed in followers' tables...
		const post = await db.query.postsTable.findFirst({ where: eq(postsTable.id, model.id) });
		if (post?.published_at) {
			return unprocessable();
		}

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Create or update the article, if applicable
		if (model.type === ARTICLE_POST) {
			if (model.articleId == null) {
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
		let slug;
		let newPost;
		if (model.id < 0) {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title!) : uuid(),
				text: model.text,
				type: model.type || 0,
				image: model.image,
				articleId: model.articleId,
				url: model.url,
				title: model.title,
				publication: model.publication,
				created_at: new Date(),
				updated_at: new Date(),
				published_at: new Date(),
			};
			newPost = (await db.insert(postsTable).values(post).returning())[0];
		} else {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title!) : undefined,
				text: model.text,
				type: model.type || 0,
				image: model.image,
				articleId: model.articleId,
				url: model.url,
				title: model.title,
				publication: model.publication,
				updated_at: new Date(),
				published_at: new Date(),
			};
			newPost = (
				await db.update(postsTable).set(post).where(eq(postsTable.id, model.id)).returning()
			)[0];
		}

		// Put it in the feed table as well, so that it shows up in our feed
		const feed = {
			slug: newPost.slug,
			text: model.text,
			type: ARTICLE_POST,
			image: model.image,
			url: model.url,
			title: model.title,
			publication: model.publication,
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(feedTable).values(feed);

		// Send it to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`posts/send`, { id: newPost.id }, token);

		// Return
		const view = postPreview(newPost, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
