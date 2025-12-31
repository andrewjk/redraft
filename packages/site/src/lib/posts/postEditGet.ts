import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, eventsTable, postsTable, usersTable } from "../../data/schema";
import { Article } from "../../data/schema/articlesTable";
import { Event } from "../../data/schema/eventsTable";
import { Post } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import type PostEditModel from "../../types/posts/PostEditModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function postEditGet(slug: string, code: string) {
	let errorMessage = "";

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

		// Load other post things
		let children: Post[] = [];
		let article: Article | undefined;
		let event: Event | undefined;

		const loadChildren = async () => {
			if (post.child_count) {
				children = await db.query.postsTable.findMany({
					where: and(eq(postsTable.parent_id, post.id), isNull(postsTable.deleted_at)),
				});
			}
		};

		const loadArticle = async () => {
			if (post.article_id) {
				article = await db.query.articlesTable.findFirst({
					where: eq(articlesTable.id, post.article_id),
				});
			}
		};

		const loadEvent = async () => {
			if (post.event_id) {
				event = await db.query.eventsTable.findFirst({
					where: eq(eventsTable.id, post.event_id),
				});
			}
		};

		await Promise.all([loadChildren(), loadArticle(), loadEvent()]);

		// Create the view
		const view = createView(post, article, event, children);

		return ok({ post: view });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}

function createView(
	post: Post & { postTags?: { tag: Tag }[] },
	article?: Article,
	event?: Event,
	children?: Post[],
): PostEditModel {
	return {
		id: post.id,
		slug: post.slug,
		published: !!post.published_at || undefined,
		text: post.text,
		visibility: post.visibility,
		listId: post.list_id ?? undefined,
		hasImage: !!post.image || undefined,
		image: post.image ?? undefined,
		imageAltText: post.image_alt_text ?? undefined,
		isArticle: !!article || undefined,
		articleId: article?.id,
		articleText: article?.text,
		isEvent: !!event || undefined,
		eventId: event?.id,
		eventText: event?.text,
		eventLocation: event?.location ?? undefined,
		eventStartsAt: event?.starts_at,
		eventDuration: event?.duration ?? undefined,
		hasLink: !!post.link_url || undefined,
		linkUrl: post.link_url ?? undefined,
		linkImage: post.link_image ?? undefined,
		linkTitle: post.link_title ?? undefined,
		linkPublication: post.link_publication ?? undefined,
		linkEmbedSrc: post.link_embed_src ?? undefined,
		linkEmbedWidth: post.link_embed_width ?? undefined,
		linkEmbedHeight: post.link_embed_height ?? undefined,
		hasRating: post.rating_value !== null ? true : undefined,
		ratingValue: post.rating_value ?? undefined,
		ratingBound: post.rating_bound ?? undefined,
		children: (children ?? []).map((c) => createView(c)),
		tags: post.postTags?.map((pt) => pt.tag.text).join("; "),
	} satisfies PostEditModel;
}
