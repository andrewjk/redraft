import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, postsTable, usersTable } from "../../data/schema";
import { Article } from "../../data/schema/articlesTable";
import { Post } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import { PostEditModel } from "./PostEditModel";

export default async function postEdit(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the post from the database
		const postQuery = db.query.postsTable.findFirst({
			where: eq(postsTable.slug, slug),
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
			},
		});

		const [currentUser, post] = await Promise.all([currentUserQuery, postQuery]);
		if (!currentUser) {
			return unauthorized();
		}
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

		// If it has children, get them
		let children: Post[] = [];
		if (post.child_count) {
			children = await db.query.postsTable.findMany({
				where: and(eq(postsTable.parent_id, post.id), isNull(postsTable.deleted_at)),
			});
		}

		// Create the view
		const view = createView(post, article, children);

		return ok({ post: view });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}

function createView(
	post: Post & { postTags?: { tag: Tag }[] },
	article?: Article,
	children?: Post[],
): PostEditModel {
	return {
		id: post.id,
		published: !!post.published_at,
		text: post.text,
		visibility: post.visibility,
		listId: post.list_id,
		hasImage: !!post.image,
		image: post.image,
		imageAltText: post.image_alt_text,
		isArticle: post.is_article,
		articleId: article ? article.id : null,
		articleText: article ? article.text : null,
		hasLink: !!post.link_url,
		linkUrl: post.link_url,
		linkImage: post.link_image,
		linkTitle: post.link_title,
		linkPublication: post.link_publication,
		linkEmbedSrc: post.link_embed_src,
		linkEmbedWidth: post.link_embed_width,
		linkEmbedHeight: post.link_embed_height,
		children: children?.map((c) => createView(c)),
		tags: post.postTags?.map((pt) => pt.tag.text).join("; "),
	} satisfies PostEditModel;
}
