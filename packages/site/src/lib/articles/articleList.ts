import database from "@/data/database";
import { postsTable } from "@/data/schema";
import { ARTICLE_POST_TYPE } from "@/lib/constants";
import { notFound, ok, serverError } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import postPreview, { PostPreview } from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";

export type ArticleList = {
	posts: PostPreview[];
	postsCount: number;
};

export default async function articleList(
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<Response> {
	try {
		const db = database();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// TODO: Only show drafts to the logged in user
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

		return ok({
			posts,
			postsCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
