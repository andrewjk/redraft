import db from "@/data/db";
import { feedTable, postsTable } from "@/data/schema";
import { ARTICLE_POST, IMAGE_POST } from "@/data/schema/postsTable";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import postPreview from "./postPreview";

export type PostPublishModel = {
	id: number;
	type: number;
	text: string;
	image: string;
	title: string;
	description: string;
};

export default async function postPublish(request: Request, token: string) {
	try {
		const model: PostPublishModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Create or update the post
		let slug;
		let newPost;
		if (model.id < 0) {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title) : uuid(),
				type: model.type || 0,
				text: model.text,
				image: model.image,
				title: model.title,
				description: model.description,
				created_at: new Date(),
				updated_at: new Date(),
				published_at: new Date(),
			};
			newPost = (await db.insert(postsTable).values(post).returning())[0];
		} else {
			const post = {
				slug: model.type === ARTICLE_POST ? sluggify(model.title!) : undefined,
				type: model.type || 0,
				text: model.text,
				image: model.image,
				title: model.title,
				description: model.description,
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
			type: ARTICLE_POST,
			text: model.text,
			image: model.image,
			title: model.title,
			description: model.description,
			url: `${currentUser.url}posts/${slug}`,
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
