import db from "@/data/db";
import { articlesTable } from "@/data/schema";
import { desc, isNotNull } from "drizzle-orm";
import articlePreview, { type ArticlePreview } from "./articlePreview";

export default async function articleList(
	limit?: number,
	offset?: number,
): Promise<{ articles: ArticlePreview[]; articlesCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

	// Get the articles from the database
	const dbarticles = await db.query.articlesTable.findMany({
		limit,
		offset,
		where: isNotNull(articlesTable.published_at),
		orderBy: desc(articlesTable.published_at),
	});

	// Get the total article count
	const articlesCount = await db.$count(articlesTable);

	// Create article previews
	const articles = dbarticles.map((article) => articlePreview(article, user!));

	return {
		articles,
		articlesCount,
	};
}
