import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, postsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type PostEditModel = {
	id: number;
	published: boolean;
	text: string;
	visibility: number;
	hasImage: boolean;
	image: string | null;
	isArticle: boolean;
	articleId: number | null;
	articleText: string | null;
	hasLink: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	tags: string | null;
};

export default async function postEdit(slug: string, code: string) {
	try {
		const db = database();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
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
		if (post.is_article && post.article_id) {
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
			image: post.image,
			hasImage: !!post.image,
			isArticle: post.is_article,
			articleId: article ? article.id : null,
			articleText: article ? article.text : null,
			hasLink: !!post.link_url,
			linkUrl: post.link_url,
			linkImage: post.link_image,
			linkTitle: post.link_title,
			linkPublication: post.link_publication,
			tags: post.postTags.map((pt) => pt.tag.text).join("; "),
		};

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
