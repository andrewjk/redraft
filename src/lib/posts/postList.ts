import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { desc, sql } from "drizzle-orm";
import postPreview, { type PostPreview } from "./postPreview";

export default async function postList(
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	// Get the posts from the database
	const dbposts = await db.query.postsTable.findMany({
		limit,
		offset,
		orderBy: desc(postsTable.updated_at),
		//extras: {
		//	// HACK: https://github.com/drizzle-team/drizzle-orm/issues/3493
		//	//commentCount: db
		//	//	.$count(commentsTable, eq(commentsTable.post_id, postsTable.id))
		//	//	.as("commentCount"),
		//	commentCount: sql`(select count(*) from comments where comments.post_id = postsTable.id)`.as(
		//		"commentCount",
		//	),
		//},
	});

	// Get the total post count
	const postsCount = await db.$count(postsTable);

	// Create post previews
	const posts = dbposts.map((post) => postPreview(post, user!));

	return {
		posts,
		postsCount,
	};
}
