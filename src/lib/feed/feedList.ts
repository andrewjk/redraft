import db from "@/data/db";
import { feedTable } from "@/data/schema";
import { desc } from "drizzle-orm";
import postPreview, { type PostPreview } from "../posts/postPreview";

export default async function feedList(
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	// Get the posts from the database
	const dbposts = await db.query.feedTable.findMany({
		limit,
		offset,
		orderBy: desc(feedTable.updated_at),
		with: { user: true },
	});

	// Get the total post count
	const postsCount = await db.$count(feedTable);

	// Create post previews
	const posts = dbposts.map((post) => postPreview(post, user!));

	return {
		posts,
		postsCount,
	};
}
