import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postReactionsTable, postsTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

export type PostLikeModel = {
	slug: string;
	sharedKey: string;
	liked: boolean;
};

export default async function postLiked(request: Request) {
	try {
		const db = database();

		const model: PostLikeModel = await request.json();

		// Get the user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the user who liked the post
		let currentUser = await db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, model.sharedKey),
			columns: { id: true, name: true },
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Get the post
		let post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, model.slug),
			columns: { id: true, slug: true },
		});
		if (!post) {
			return notFound();
		}

		// Get the reaction if it's already been added
		let reaction = await db.query.postReactionsTable.findFirst({
			where: and(
				eq(postReactionsTable.user_id, currentUser.id),
				eq(postReactionsTable.post_id, post.id),
			),
		});

		// Insert or delete the reaction
		if (model.liked) {
			if (reaction) {
				await db
					.update(postReactionsTable)
					.set({
						liked: true,
					})
					.where(eq(postReactionsTable.id, reaction.id));
			} else {
				await db.insert(postReactionsTable).values({
					post_id: post.id,
					user_id: currentUser.id,
					liked: true,
					created_at: new Date(),
				});
			}
		} else {
			if (reaction) {
				if (reaction.emoji) {
					await db
						.update(postReactionsTable)
						.set({
							liked: false,
						})
						.where(eq(postReactionsTable.id, reaction.id));
				} else {
					await db.delete(postReactionsTable).where(eq(postReactionsTable.id, reaction.id));
				}
			}
		}

		// Update the post's like count
		await db
			.update(postsTable)
			.set({
				like_count: db.$count(
					postReactionsTable,
					and(eq(postReactionsTable.post_id, post.id), eq(postReactionsTable.liked, true)),
				),
			})
			.where(eq(postsTable.slug, model.slug));

		// Create a notification
		await db.insert(notificationsTable).values({
			url: `${user.url}posts/${post.slug}`,
			text: `${currentUser.name} liked your post`,
			created_at: new Date(),
			updated_at: new Date(),
		});

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
