import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import database from "../../data/database";
import { postsTable, usersTable } from "../../data/schema";
import { ARTICLE_POST_TYPE } from "../constants";
import postPreview, { PostPreview } from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type ArticleList = {
	posts: PostPreview[];
	postsCount: number;
};

export async function articleList(limit?: number, offset?: number) {
	return await getArticles(false, limit, offset);
}

export async function draftArticleList(code: string, limit?: number, offset?: number) {
	return await getArticles(true, limit, offset, code);
}

async function getArticles(
	drafts: boolean,
	limit?: number,
	offset?: number,
	code?: string,
): Promise<Response> {
	try {
		const db = database();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		if (drafts) {
			const draftsUser = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, userIdQuery(code!)),
			});
			if (!draftsUser) {
				return unauthorized();
			}
		}

		let condition = and(
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
