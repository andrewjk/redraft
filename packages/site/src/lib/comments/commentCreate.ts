import { created, notFound, serverError, unauthorized } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import database from "../../data/database";
import {
	commentsTable,
	feedTable,
	followedByTable,
	postsTable,
	usersTable,
} from "../../data/schema";
import * as api from "../api";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";
import commentPreview from "./commentPreview";

export type CommentCreateModel = {
	postSlug: string;
	parentSlug: string;
	text: string;
};

export default async function commentCreate(
	request: Request,
	params: Record<string, string>,
	url: string,
	sharedKey: string,
	code: string,
	token: string,
) {
	try {
		const db = database();

		const model: CommentCreateModel = await request.json();

		// Get the user who created this comment, from url and shared key
		let isFollower = true;
		let currentUser = await db.query.followedByTable.findFirst({
			where: and(eq(followedByTable.url, url), eq(followedByTable.shared_key, sharedKey)),
			columns: {
				id: true,
				url: true,
				image: true,
				name: true,
			},
		});

		if (!currentUser) {
			// Get the current user, from url and code
			isFollower = false;
			currentUser = await db.query.usersTable.findFirst({
				where: and(eq(usersTable.url, url), eq(usersTable.id, userIdQuery(code))),
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
			where: eq(postsTable.slug, model.postSlug),
			columns: { id: true },
		});
		if (!post) {
			return notFound();
		}

		// Get the parent id
		let parentId: number | undefined;
		if (model.parentSlug) {
			const parent = await db.query.commentsTable.findFirst({
				where: eq(commentsTable.slug, model.parentSlug),
				columns: { id: true },
			});
			if (!parent) {
				return notFound();
			}
			parentId = parent.id;
		}

		// Create the comment
		const comment = {
			user_id: isFollower ? currentUser.id : null,
			post_id: post.id,
			parent_id: parentId,
			slug: uuid(),
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
			.where(eq(feedTable.slug, model.postSlug));
		await Promise.all([updatePosts, updateFeed]);

		// Send an update to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`comments/send`, params, { post_id: post.id }, token);

		// Return
		const view = commentPreview(newComment, currentUser, []);
		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
