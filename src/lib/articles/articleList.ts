import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { ARTICLE_POST_TYPE } from "@/lib/constants";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import postPreview, { PostPreview } from "../posts/postPreview";

export default async function articleList(
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<{ posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	const condition = and(
		eq(postsTable.type, ARTICLE_POST_TYPE),
		drafts ? isNull(postsTable.published_at) : isNotNull(postsTable.published_at),
	);

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
