import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { desc, isNotNull } from "drizzle-orm";
import postPreview, { type PostPreview } from "./postPreview";

export default async function postList(
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	const condition = isNotNull(postsTable.published_at);

	// Get the posts from the database
	const dbposts = await db.query.postsTable.findMany({
		limit,
		offset,
		where: condition,
		orderBy: [desc(postsTable.pinned), desc(postsTable.updated_at)],
	});

	// Get the total post count
	const postsCount = await db.$count(postsTable, condition);

	// Create post previews
	const posts = dbposts.map((post) => postPreview(post, user!));

	return {
		posts,
		postsCount,
	};
}
