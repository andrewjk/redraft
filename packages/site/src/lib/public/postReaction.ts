import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, count, desc, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, postReactionsTable, postsTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

export type PostReactionModel = {
	slug: string;
	sharedKey: string;
	emoji: string;
};

export default async function postReaction(request: Request) {
	try {
		const db = database();

		const model: PostReactionModel = await request.json();

		// Get the user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the user who reacted to the post
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
		if (model.emoji) {
			if (reaction) {
				await db
					.update(postReactionsTable)
					.set({
						emoji: model.emoji,
					})
					.where(eq(postReactionsTable.id, reaction.id));
			} else {
				await db.insert(postReactionsTable).values({
					post_id: post.id,
					user_id: currentUser.id,
					emoji: model.emoji,
					created_at: new Date(),
				});
			}
		} else {
			if (reaction) {
				if (reaction.liked) {
					await db
						.update(postReactionsTable)
						.set({
							emoji: "",
						})
						.where(eq(postReactionsTable.id, reaction.id));
				} else {
					await db.delete(postReactionsTable).where(eq(postReactionsTable.id, reaction.id));
				}
			}
		}

		// Update the post's popular emojis
		const emojiCounts = await db
			.select({ value: postReactionsTable.emoji, count: count(postReactionsTable.id).as("count") })
			.from(postReactionsTable)
			.groupBy(postReactionsTable.emoji)
			.orderBy(({ count }) => desc(count))
			.limit(3);
		await db
			.update(postsTable)
			.set({
				emoji_first: emojiCounts[0]?.value,
				emoji_second: emojiCounts[1]?.value,
				emoji_third: emojiCounts[2]?.value,
			})
			.where(eq(postsTable.id, post.id));

		// Create a notification
		await db.insert(notificationsTable).values({
			url: `${user.url}posts/${post.slug}`,
			text: `${currentUser.name} reacted to your post with ${model.emoji}`,
			created_at: new Date(),
			updated_at: new Date(),
		});

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
