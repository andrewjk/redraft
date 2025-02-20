import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { ARTICLE_POST } from "@/data/schema/postsTable";
import { and, desc, eq, isNull } from "drizzle-orm";
import postPreview, { PostPreview } from "../posts/postPreview";

export default async function articleDraftList(
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	const condition = and(eq(postsTable.type, ARTICLE_POST), isNull(postsTable.published_at));

	// Get the articles from the database
	const dbarticles = await db.query.postsTable.findMany({
		limit,
		offset,
		where: condition,
		orderBy: desc(postsTable.updated_at),
	});

	// Get the total article count
	const postsCount = await db.$count(postsTable, condition);

	// Create article previews
	const posts = dbarticles.map((article) => postPreview(article, user!));

	return {
		posts,
		postsCount,
	};
}
