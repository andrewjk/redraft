import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, eventsTable, postsTable, usersTable } from "../../data/schema";
import { Article } from "../../data/schema/articlesTable";
import { Event } from "../../data/schema/eventsTable";
import { Post } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import type PostEditModel from "../../types/posts/PostEditModel";
import { ARTICLE_LINK_TYPE, EVENT_LINK_TYPE } from "../constants";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function postEdit(slug: string, code: string) {
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
		console.log(event);
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
		published: !!post.published_at,
		text: post.text,
		visibility: post.visibility,
		listId: post.list_id,
		hasImage: !!post.image,
		image: post.image,
		imageAltText: post.image_alt_text,
		isArticle: post.link_type === ARTICLE_LINK_TYPE,
		articleId: article?.id ?? null,
		articleText: article?.text ?? null,
		isEvent: post.link_type === EVENT_LINK_TYPE,
		eventId: event?.id ?? null,
		eventText: event?.text ?? null,
		eventLocation: event?.location ?? null,
		eventStartsAt: event?.starts_at ?? null,
		eventDuration: event?.duration ?? null,
		hasLink: !!post.link_url,
		linkUrl: post.link_url,
		linkImage: post.link_image,
		linkTitle: post.link_title,
		linkPublication: post.link_publication,
		linkEmbedSrc: post.link_embed_src,
		linkEmbedWidth: post.link_embed_width,
		linkEmbedHeight: post.link_embed_height,
		hasRating: !!post.rating_value,
		ratingValue: post.rating_value,
		ratingBound: post.rating_bound,
		children: children?.map((c) => createView(c)),
		tags: post.postTags?.map((pt) => pt.tag.text).join("; "),
	} satisfies PostEditModel;
}
