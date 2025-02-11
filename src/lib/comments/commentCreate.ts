import db from "@/data/db";
import { commentsTable, feedTable, followedByTable, postsTable, usersTable } from "@/data/schema";
import * as api from "@/lib/api";
import { created, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import getErrorMessage from "../utils/getErrorMessage";
import commentPreview from "./commentPreview";

export type CommentCreateModel = {
	postslug: string;
	text: string;
};

export default async function commentCreate(request: Request, url: string, token: string) {
	try {
		const model: CommentCreateModel = await request.json();

		// Get the user who created this comment
		let isFollower = true;
		let currentUser = await db.query.followedByTable.findFirst({
			where: eq(followedByTable.url, url),
			columns: {
				id: true,
				url: true,
				image: true,
				name: true,
			},
		});
		if (!currentUser) {
			isFollower = false;
			currentUser = await db.query.usersTable.findFirst({
				where: eq(usersTable.url, url),
				columns: {
					id: true,
					url: true,
					image: true,
					name: true,
				},
			});
		}
		if (!currentUser) {
			return unauthorized();
		}

		// Get the post id
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, model.postslug),
			columns: { id: true },
		});
		if (!post) {
			return unauthorized();
		}

		const slug = uuid();

		// Create the comment
		const comment = {
			user_id: isFollower ? currentUser.id : null,
			post_id: post.id,
			slug,
			text: model.text,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const newComment = (await db.insert(commentsTable).values(comment).returning())[0];

		// Update the post and feed tables
		const updatePosts = db
			.update(postsTable)
			.set({
				comment_count: db.$count(commentsTable, eq(commentsTable.post_id, post.id)),
				last_comment_at: new Date(),
			})
			.where(eq(postsTable.id, post.id));
		const updateFeed = db
			.update(feedTable)
			.set({
				comment_count: db.$count(commentsTable, eq(commentsTable.post_id, post.id)),
				last_comment_at: new Date(),
			})
			.where(eq(feedTable.slug, model.postslug));
		await Promise.all([updatePosts, updateFeed]);

		// Send an update to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`comments/send`, { post_id: post.id }, token);

		// Return
		const view = commentPreview(newComment, currentUser);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
