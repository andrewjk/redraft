import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { desc } from "drizzle-orm";
import postPreview, { type PostPreview } from "./postPreview";

export default async function postList(
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the posts from the database
	const dbposts = await db.query.postsTable.findMany({
		limit,
		offset,
		orderBy: desc(postsTable.updated_at),
	});

	// Get the total post count
	const postsCount = await db.$count(postsTable);

	// Create post previews
	const posts = dbposts.map((post) => postPreview(post));

	return {
		posts,
		postsCount,
	};
}
