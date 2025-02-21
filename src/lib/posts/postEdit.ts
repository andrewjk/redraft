import db from "@/data/db";
import { articlesTable, postsTable } from "@/data/schema";
import { ARTICLE_POST } from "@/data/schema/postsTable";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type PostEditModel = {
	id: number;
	published: boolean;
	type: number;
	text: string;
	image: string | null;
	articleId: number | null;
	url: string | null;
	title: string | null;
	publication: string | null;
	articleText: string | null;
};

export default async function postEdit(slug: string) {
	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the post from the database
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
		});
		if (!post) {
			return notFound();
		}

		// If it's an article, get the article text
		let article;
		if (post.type === ARTICLE_POST && post.article_id) {
			article = await db.query.articlesTable.findFirst({
				where: eq(articlesTable.id, post.article_id),
			});
		}

		// Create the view
		const view: PostEditModel = {
			id: post.id,
			published: !!post.published_at,
			type: post.type,
			text: post.text,
			image: post.image,
			url: post.url,
			title: post.title,
			publication: post.publication,
			articleId: article ? article.id : null,
			articleText: article ? article.text : null,
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
