import { badRequest, created, notFound, serverError, unauthorized } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import {
	activityTable,
	commentsTable,
	feedTable,
	followedByTable,
	postsTable,
	usersTable,
} from "../../data/schema";
import transaction from "../../data/transaction";
import commentsSend from "../../routes/api/comments/send/+server";
import type CommentCreateModel from "../../types/comments/CommentCreateModel";
import CommentCreateSchema from "../../types/comments/CommentCreateSchema";
import { ACTIVITY_RECEIVED_VERSION } from "../../types/public/ActivityReceivedModel";
import type ActivityReceivedModel from "../../types/public/ActivityReceivedModel";
import * as api from "../api";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";
import commentPreview from "./commentPreview";

export default async function commentCreate(
	request: Request,
	params: Record<string, string>,
	url: string,
	sharedKey: string,
	code: string,
	token: string,
) {
	let errorMessage = "";

	try {
		const db = database();

		let model: CommentCreateModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(CommentCreateSchema, model);
		if (!validated.success) {
			return badRequest({
				message: validated.issues.map((e) => e.message).join("\n"),
				data: model,
			});
		}
		model = validated.output;

		// Get the user
		const userQuery = db.query.usersTable.findFirst();

		// Get the user who created this comment, from url and shared key
		let isFollower = true;
		let currentUserQuery = db.query.followedByTable.findFirst({
			where: and(eq(followedByTable.url, url), eq(followedByTable.shared_key, sharedKey)),
			columns: {
				id: true,
				url: true,
				image: true,
				name: true,
			},
		});

		// Get the post id
		const postQuery = db.query.postsTable.findFirst({
			where: eq(postsTable.slug, model.postSlug),
			columns: { id: true, slug: true },
		});

		let [user, currentUser, post] = await Promise.all([userQuery, currentUserQuery, postQuery]);
		if (!user) {
			return notFound({
				message: "User not found",
				data: model,
			});
		}
		if (!post) {
			return notFound({
				message: "Post not found",
				data: model,
			});
		}

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
			return unauthorized({
				message: "Unauthorized",
				data: model,
			});
		}

		// Get the parent id
		let parentId: number | undefined;
		if (model.parentSlug) {
			const parent = await db.query.commentsTable.findFirst({
				where: eq(commentsTable.slug, model.parentSlug),
				columns: { id: true },
			});
			if (!parent) {
				return notFound({
					message: "Parent not found",
					data: model,
				});
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

		let result;
		await transaction(db, async (tx) => {
			try {
				const newComment = (await tx.insert(commentsTable).values(comment).returning())[0];

				// Update the post and feed tables
				const updatePosts = tx
					.update(postsTable)
					.set({
						comment_count: tx.$count(commentsTable, eq(commentsTable.post_id, post.id)),
						last_comment_at: new Date(),
					})
					.where(eq(postsTable.id, post.id));
				const updateFeed = tx
					.update(feedTable)
					.set({
						comment_count: tx.$count(commentsTable, eq(commentsTable.post_id, post.id)),
						last_comment_at: new Date(),
					})
					.where(eq(feedTable.slug, model.postSlug));
				await Promise.all([updatePosts, updateFeed]);

				// Create a notification if it's a comment created by a follower, and an
				// activity record otherwise
				if (isFollower) {
					await createNotification(
						tx,
						`${user.url}posts/${post.slug}`,
						`${currentUser.name} commented on your post`,
					);

					// Send the activity off to be created in the follower's database
					let sendUrl = `${currentUser.url}api/public/activity`;
					let sendData: ActivityReceivedModel = {
						sharedKey,
						url: `${user.url}posts/${post.slug}`,
						type: "commented",
						version: ACTIVITY_RECEIVED_VERSION,
					};
					/*await*/ postPublic(sendUrl, sendData);
				} else {
					await tx.insert(activityTable).values({
						url: `${user.url}posts/${post.slug}`,
						text: "You commented on your post",
						created_at: new Date(),
						updated_at: new Date(),
					});
				}

				// Return
				const view = commentPreview(newComment, currentUser, []);
				result = created(view);
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send an update to all followers
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		// It has to be done outside of the transaction
		api.post(`comments/send`, commentsSend, params, { post_id: post.id }, token);

		if (isFollower) {
			updateNotificationCounts(db);
		}

		return result;
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
