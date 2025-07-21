import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, postsTable, usersTable } from "../../data/schema";
import { Article } from "../../data/schema/articlesTable";
import { Post } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type PostEditModel = {
	id: number;
	published: boolean;
	text: string;
	visibility: number;
	hasImage: boolean;
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	articleId: number | null;
	articleText: string | null;
	hasLink: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	children?: PostEditModel[];
	tags?: string;
};

export default async function postEdit(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the current user
				const currentUser = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, userIdQuery(code)),
				});
				if (!currentUser) {
					return unauthorized();
				}

				// Get the post from the database
				const post = await tx.query.postsTable.findFirst({
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
					article = await tx.query.articlesTable.findFirst({
						where: eq(articlesTable.id, post.article_id),
					});
				}

				// If it has children, get them
				let children: Post[] = [];
				if (post.child_count) {
					children = await tx.query.postsTable.findMany({
						where: and(eq(postsTable.parent_id, post.id), isNull(postsTable.deleted_at)),
					});
				}

				// Create the view
				const view = createView(post, article, children);

				return ok({ post: view });
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
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
