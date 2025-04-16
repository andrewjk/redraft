import database from "@/data/database";
import { articlesTable, postsTable } from "@/data/schema";
import { ARTICLE_POST_TYPE } from "@/lib/constants";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type PostEditModel = {
	id: number;
	published: boolean;
	text: string;
	visibility: number;
	type: number;
	image: string | null;
	articleId: number | null;
	url: string | null;
	title: string | null;
	publication: string | null;
	articleText: string | null;
	tags: string | null;
};

export default async function postEdit(slug: string) {
	const db = database();

	try {
		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the post from the database
		const post = await db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
			},
		});
		if (!post) {
			return notFound();
		}

		// If it's an article, get the article text
		let article;
		if (post.type === ARTICLE_POST_TYPE && post.article_id) {
			article = await db.query.articlesTable.findFirst({
				where: eq(articlesTable.id, post.article_id),
			});
		}

		// Create the view
		const view: PostEditModel = {
			id: post.id,
			published: !!post.published_at,
			text: post.text,
			visibility: post.visibility,
			type: post.type,
			image: post.image,
			url: post.url,
			title: post.title,
			publication: post.publication,
			articleId: article ? article.id : null,
			articleText: article ? article.text : null,
			tags: post.postTags.map((pt) => pt.tag.text).join("; "),
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
