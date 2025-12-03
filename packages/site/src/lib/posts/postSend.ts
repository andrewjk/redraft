import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq, sql } from "drizzle-orm";
import database from "../../data/database";
import { postsQueueTable, postsTable, usersTable } from "../../data/schema";
import type PostSendModel from "../../types/posts/PostSendModel";
import { FEED_RECEIVED_VERSION } from "../../types/public/FeedReceivedModel";
import type FeedReceivedModel from "../../types/public/FeedReceivedModel";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import pluralize from "../utils/pluralize";
import userIdQuery from "../utils/userIdQuery";

export default async function postSend(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: PostSendModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Load the post
		const postQuery = db.query.postsTable.findFirst({ where: eq(postsTable.id, model.id) });

		const [currentUser, post] = await Promise.all([currentUserQuery, postQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!post) {
			return notFound();
		}

		// NOTE: Don't use a transaction here, we want each operation to be atomic

		// Insert a queue record for each follower and delete it on success. If
		// there are any failures, add a notification, with a resend option
		if (post.list_id) {
			await db.run(sql`
					insert into posts_queue (post_id, user_id, url, shared_key, created_at, updated_at)
					select ${post.id}, user_id, url, shared_key, current_timestamp, current_timestamp
					from lists
					join list_users on lists.id = list_users.list_id
					join followed_by on user_id = followed_by.id
					where lists.id = ${post.list_id}`);
		} else {
			await db.run(sql`
					insert into posts_queue (post_id, user_id, url, shared_key, created_at, updated_at)
					select ${post.id}, id, url, shared_key, current_timestamp, current_timestamp
					from followed_by`);
		}

		// Load the queue
		const queue = await db.query.postsQueueTable.findMany({
			where: eq(postsQueueTable.post_id, post.id),
		});

		let failureCount = 0;

		for (let follower of queue) {
			try {
				let sendUrl = `${follower.url}api/public/feed`;
				let sendData: FeedReceivedModel = {
					sharedKey: follower.shared_key,
					slug: post.slug,
					text: post.text,
					visibility: post.visibility,
					image: post.image,
					imageAltText: post.image_alt_text,
					linkType: post.link_type,
					linkUrl: post.link_url,
					linkTitle: post.link_title,
					linkImage: post.link_image,
					linkPublication: post.link_publication,
					linkEmbedSrc: post.link_embed_src,
					linkEmbedWidth: post.link_embed_width,
					linkEmbedHeight: post.link_embed_height,
					ratingValue: post.rating_value,
					ratingBound: post.rating_bound,
					childCount: post.child_count,
					publishedAt: post.published_at!,
					republishedAt: post.republished_at,
					version: FEED_RECEIVED_VERSION,
				};
				await postPublic(sendUrl, sendData);
				await db.delete(postsQueueTable).where(eq(postsQueueTable.id, follower.id));
			} catch {
				// It failed, so increment the failure count in the
				// table and for notifications
				await db
					.update(postsQueueTable)
					.set({
						failure_count: follower.failure_count + 1,
						retry_at: follower.failure_count === 0 ? oneHourFromNow() : oneDayFromNow(),
					})
					.where(eq(postsQueueTable.id, follower.id));
				failureCount++;
			}
		}

		if (failureCount) {
			// Create a notification
			await createNotification(
				db,
				`${currentUser.url}posts/${post.slug}/status`,
				`Failed to send ${failureCount} ${pluralize(failureCount, "post")}`,
			);
			updateNotificationCounts(db);
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}

function oneHourFromNow() {
	let now = new Date();
	now.setTime(now.getTime() + 1 * 60 * 60 * 1000);
	return now;
}

function oneDayFromNow() {
	let now = new Date();
	now.setTime(now.getTime() + 24 * 60 * 60 * 1000);
	return now;
}
