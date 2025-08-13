import { notFound, ok, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postReactionsTable, postsTable } from "../../data/schema";
import createNotification from "../utils/createNotification";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const POST_LIKED_VERSION = 1;

export type PostLikedModel = {
	slug: string;
	sharedKey: string;
	liked: boolean;
	version: number;
};

export default async function postLiked(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: PostLikedModel = await request.json();
		if (model.version !== POST_LIKED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${POST_LIKED_VERSION})`,
			);
		}

		// Get the user
		const userQuery = db.query.usersTable.findFirst();

		// Get the user who liked the post
		const currentUserQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, model.sharedKey),
			columns: { id: true, name: true },
		});

		// Get the post
		const postQuery = db.query.postsTable.findFirst({
			where: eq(postsTable.slug, model.slug),
			columns: { id: true, slug: true },
		});

		const [user, currentUser, post] = await Promise.all([userQuery, currentUserQuery, postQuery]);
		if (!user) {
			return notFound();
		}
		if (!currentUser) {
			return unauthorized();
		}
		if (!post) {
			return notFound();
		}

		// Get the reaction if it's already been added
		const reaction = await db.query.postReactionsTable.findFirst({
			where: and(
				eq(postReactionsTable.user_id, currentUser.id),
				eq(postReactionsTable.post_id, post.id),
			),
		});

		await db.transaction(async (tx) => {
			try {
				// Insert or delete the reaction
				if (model.liked) {
					if (reaction) {
						await tx
							.update(postReactionsTable)
							.set({
								liked: true,
							})
							.where(eq(postReactionsTable.id, reaction.id));
					} else {
						await tx.insert(postReactionsTable).values({
							post_id: post.id,
							user_id: currentUser.id,
							liked: true,
							created_at: new Date(),
						});
					}
				} else {
					if (reaction) {
						if (reaction.emoji) {
							await tx
								.update(postReactionsTable)
								.set({
									liked: false,
								})
								.where(eq(postReactionsTable.id, reaction.id));
						} else {
							await tx.delete(postReactionsTable).where(eq(postReactionsTable.id, reaction.id));
						}
					}
				}

				// Update the post's like count
				await tx
					.update(postsTable)
					.set({
						like_count: tx.$count(
							postReactionsTable,
							and(eq(postReactionsTable.post_id, post.id), eq(postReactionsTable.liked, true)),
						),
					})
					.where(eq(postsTable.slug, model.slug));

				// Create a notification
				await createNotification(
					tx,
					`${user.url}posts/${post.slug}`,
					`${currentUser.name} liked your post`,
				);
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
