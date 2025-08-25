import { notFound, ok, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { and, count, desc, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postReactionsTable, postsTable } from "../../data/schema";
import createNotification from "../notifications/createNotification";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const POST_REACTION_VERSION = 1;

export type PostReactionModel = {
	slug: string;
	sharedKey: string;
	emoji: string;
	version: number;
};

export default async function postReaction(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: PostReactionModel = await request.json();
		if (model.version !== POST_REACTION_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${POST_REACTION_VERSION})`,
			);
		}

		// Get the user
		const userQuery = db.query.usersTable.findFirst();

		// Get the user who reacted to the post
		let currentUserQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, model.sharedKey),
			columns: { id: true, name: true },
		});

		// Get the post
		let postQuery = db.query.postsTable.findFirst({
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
		let reaction = await db.query.postReactionsTable.findFirst({
			where: and(
				eq(postReactionsTable.user_id, currentUser.id),
				eq(postReactionsTable.post_id, post.id),
			),
		});

		await db.transaction(async (tx) => {
			try {
				// Insert or delete the reaction
				if (model.emoji) {
					if (reaction) {
						await tx
							.update(postReactionsTable)
							.set({
								emoji: model.emoji,
							})
							.where(eq(postReactionsTable.id, reaction.id));
					} else {
						await tx.insert(postReactionsTable).values({
							post_id: post.id,
							user_id: currentUser.id,
							emoji: model.emoji,
							created_at: new Date(),
						});
					}
				} else {
					if (reaction) {
						if (reaction.liked) {
							await tx
								.update(postReactionsTable)
								.set({
									emoji: "",
								})
								.where(eq(postReactionsTable.id, reaction.id));
						} else {
							await tx.delete(postReactionsTable).where(eq(postReactionsTable.id, reaction.id));
						}
					}
				}

				// Update the post's popular emojis
				const emojiCounts = await tx
					.select({
						value: postReactionsTable.emoji,
						count: count(postReactionsTable.id).as("count"),
					})
					.from(postReactionsTable)
					.groupBy(postReactionsTable.emoji)
					.orderBy(({ count }) => desc(count))
					.limit(3);
				await tx
					.update(postsTable)
					.set({
						emoji_first: emojiCounts[0]?.value,
						emoji_second: emojiCounts[1]?.value,
						emoji_third: emojiCounts[2]?.value,
					})
					.where(eq(postsTable.id, post.id));

				// Create a notification
				await createNotification(
					tx,
					`${user.url}posts/${post.slug}`,
					`${currentUser.name} reacted to your post with ${model.emoji}`,
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
