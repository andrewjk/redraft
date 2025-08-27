import { and, eq, inArray } from "drizzle-orm";
import { Database, type DatabaseTransaction } from "../../data/database";
import { articlesTable, eventsTable, postTagsTable, tagsTable } from "../../data/schema";
import { Post, postsTable } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import { ARTICLE_LINK_TYPE, EVENT_LINK_TYPE, LINK_LINK_TYPE } from "../constants";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import { type PostEditModel } from "./PostEditModel";

export default async function postCreateOrUpdate(
	tx: Database | DatabaseTransaction,
	model: PostEditModel,
): Promise<{
	op: "create" | "update";
	post: Post;
}> {
	// Create tags, if applicable
	let dbtags: Tag[] = [];
	if (model.tags) {
		let tags = model.tags.split(";").map((t) => t.trim());
		dbtags = await tx.query.tagsTable.findMany({
			where: inArray(tagsTable.text, tags),
		});
		for (let tag of tags) {
			if (!dbtags.find((t) => t.text === tag)) {
				dbtags.push(
					(
						await tx
							.insert(tagsTable)
							.values({
								slug: sluggify(tag),
								text: tag,
								created_at: new Date(),
								updated_at: new Date(),
							})
							.returning()
					)[0],
				);
			}
		}
	}

	// Create or update the article, if applicable
	if (model.isArticle) {
		if (!model.articleId && model.articleId !== 0) {
			model.articleId = (
				await tx
					.insert(articlesTable)
					.values({
						text: model.articleText!,
						created_at: new Date(),
						updated_at: new Date(),
					})
					.returning({ id: articlesTable.id })
			)[0].id;
		} else {
			await tx
				.update(articlesTable)
				.set({
					text: model.articleText!,
					updated_at: new Date(),
				})
				.where(eq(articlesTable.id, model.articleId!));
		}
	}

	// Create or update the event, if applicable
	if (model.isEvent) {
		if (!model.eventId && model.eventId !== 0) {
			model.eventId = (
				await tx
					.insert(eventsTable)
					.values({
						text: model.eventText!,
						location: model.eventLocation,
						starts_at: new Date(model.eventStartsAt!),
						duration: model.eventDuration,
						created_at: new Date(),
						updated_at: new Date(),
					})
					.returning({ id: eventsTable.id })
			)[0].id;
		} else {
			await tx
				.update(eventsTable)
				.set({
					location: model.eventLocation,
					starts_at: new Date(model.eventStartsAt!),
					duration: model.eventDuration,
					updated_at: new Date(),
				})
				.where(eq(eventsTable.id, model.eventId!));
		}
	}

	// Create or update the post
	if (model.id < 0) {
		const newPost = (
			await tx
				.insert(postsTable)
				.values({
					slug: model.isArticle ? sluggify(model.linkTitle!, true) : uuid(),
					text: model.text,
					visibility: model.visibility || 0,
					list_id: model.listId,
					image: model.hasImage ? model.image : null,
					image_alt_text: model.hasImage ? model.imageAltText : null,
					article_id: model.isArticle ? model.articleId : null,
					event_id: model.isEvent ? model.eventId : null,
					link_type: model.isArticle
						? ARTICLE_LINK_TYPE
						: model.isEvent
							? EVENT_LINK_TYPE
							: LINK_LINK_TYPE,
					link_url: model.hasLink || model.isArticle || model.isEvent ? model.linkUrl : null,
					link_title: model.hasLink || model.isArticle || model.isEvent ? model.linkTitle : null,
					link_image: model.hasLink || model.isArticle || model.isEvent ? model.linkImage : null,
					link_publication: model.hasLink ? model.linkPublication : null,
					link_embed_src:
						model.hasLink && model.linkEmbedSrc?.startsWith("https://") ? model.linkEmbedSrc : null,
					link_embed_width: model.hasLink ? model.linkEmbedWidth : null,
					link_embed_height: model.hasLink ? model.linkEmbedHeight : null,
					rating_value: model.hasRating ? model.ratingValue : null,
					rating_bound: model.hasRating ? model.ratingBound : null,
					child_count: model.children?.length ?? 0,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning()
		)[0];
		if (model.children?.length) {
			for (let child of model.children) {
				await tx.insert(postsTable).values({
					slug: uuid(),
					text: child.text,
					image: child.hasImage ? child.image : null,
					link_type: child.hasLink ? LINK_LINK_TYPE : null,
					link_url: child.hasLink ? child.linkUrl : null,
					link_title: child.hasLink ? child.linkTitle : null,
					link_image: child.hasLink ? child.linkImage : null,
					link_publication: child.hasLink ? child.linkPublication : null,
					link_embed_src:
						child.hasLink && child.linkEmbedSrc?.startsWith("https://") ? child.linkEmbedSrc : null,
					link_embed_width: child.hasLink ? child.linkEmbedWidth : null,
					link_embed_height: child.hasLink ? child.linkEmbedHeight : null,
					rating_value: model.hasRating ? model.ratingValue : null,
					rating_bound: model.hasRating ? model.ratingBound : null,
					parent_id: newPost.id,
					created_at: new Date(),
					updated_at: new Date(),
				});
			}
		}
		if (dbtags.length) {
			await tx
				.insert(postTagsTable)
				.values(dbtags.map((t) => ({ post_id: newPost.id, tag_id: t.id })));
		}
		return {
			op: "create",
			post: newPost,
		};
	} else {
		const newPost = (
			await tx
				.update(postsTable)
				.set({
					slug: model.isArticle ? sluggify(model.linkTitle!, true) : undefined,
					text: model.text,
					visibility: model.visibility || 0,
					list_id: model.listId,
					image: model.hasImage ? model.image : null,
					image_alt_text: model.hasImage ? model.imageAltText : null,
					article_id: model.isArticle ? model.articleId : null,
					event_id: model.isEvent ? model.eventId : null,
					link_type: model.isArticle
						? ARTICLE_LINK_TYPE
						: model.isEvent
							? EVENT_LINK_TYPE
							: LINK_LINK_TYPE,
					link_url: model.hasLink || model.isArticle || model.isEvent ? model.linkUrl : null,
					link_title: model.hasLink || model.isArticle || model.isEvent ? model.linkTitle : null,
					link_image: model.hasLink || model.isArticle || model.isEvent ? model.linkImage : null,
					link_publication: model.hasLink ? model.linkPublication : null,
					link_embed_src:
						model.hasLink && model.linkEmbedSrc?.startsWith("https://") ? model.linkEmbedSrc : null,
					link_embed_width: model.hasLink ? model.linkEmbedWidth : null,
					link_embed_height: model.hasLink ? model.linkEmbedHeight : null,
					rating_value: model.hasRating ? model.ratingValue : null,
					rating_bound: model.hasRating ? model.ratingBound : null,
					child_count: model.children?.length ?? 0,
					updated_at: new Date(),
				})
				.where(eq(postsTable.id, model.id))
				.returning()
		)[0];
		if (model.children?.length) {
			// Update the children in the database
			const currentChildren = await tx.query.postsTable.findMany({
				where: eq(postsTable.parent_id, newPost.id),
			});
			let updates = [];
			for (let child of currentChildren) {
				if (!model.children.find((c) => c.id === child.id)) {
					updates.push(
						tx
							.update(postsTable)
							.set({ deleted_at: new Date() })
							.where(eq(postsTable.id, child.id)),
					);
				}
			}
			for (let child of model.children) {
				const currentChild = currentChildren.find((c) => c.id === child.id);
				if (currentChild) {
					updates.push(
						tx
							.update(postsTable)
							.set({
								text: child.text,
								// TODO: Allow hiding child posts
								//visibility: child.visibility || 0,
								image: child.hasImage ? child.image : null,
								link_type: child.hasLink ? LINK_LINK_TYPE : null,
								link_url: child.hasLink ? child.linkUrl : null,
								link_title: child.hasLink ? child.linkTitle : null,
								link_image: child.hasLink ? child.linkImage : null,
								link_publication: child.hasLink ? child.linkPublication : null,
								link_embed_src:
									child.hasLink && child.linkEmbedSrc?.startsWith("https://")
										? child.linkEmbedSrc
										: null,
								link_embed_width: child.hasLink ? child.linkEmbedWidth : null,
								link_embed_height: child.hasLink ? child.linkEmbedHeight : null,
								rating_value: model.hasRating ? model.ratingValue : null,
								rating_bound: model.hasRating ? model.ratingBound : null,
								updated_at: new Date(),
							})
							.where(eq(postsTable.id, child.id)),
					);
				} else {
					updates.push(
						tx.insert(postsTable).values({
							slug: uuid(),
							text: child.text,
							// TODO: Allow hiding child posts
							//visibility: child.visibility || 0,
							image: child.hasImage ? child.image : null,
							link_url: child.hasLink ? child.linkUrl : null,
							link_title: child.hasLink ? child.linkTitle : null,
							link_image: child.hasLink ? child.linkImage : null,
							link_publication: child.hasLink ? child.linkPublication : null,
							link_embed_src:
								child.hasLink && child.linkEmbedSrc?.startsWith("https://")
									? child.linkEmbedSrc
									: null,
							link_embed_width: child.hasLink ? child.linkEmbedWidth : null,
							link_embed_height: child.hasLink ? child.linkEmbedHeight : null,
							rating_value: model.hasRating ? model.ratingValue : null,
							rating_bound: model.hasRating ? model.ratingBound : null,
							parent_id: newPost.id,
							created_at: new Date(),
							updated_at: new Date(),
						}),
					);
				}
			}
			await Promise.all(updates);
		}
		if (dbtags.length) {
			// Update the post's tags in the database
			const currentTags = await tx.query.postTagsTable.findMany({
				where: eq(postTagsTable.post_id, newPost.id),
			});
			let updates = [];
			for (let tag of currentTags) {
				if (!dbtags.find((t) => t.id === tag.tag_id)) {
					updates.push(
						tx
							.delete(postTagsTable)
							.where(
								and(eq(postTagsTable.post_id, tag.post_id), eq(postTagsTable.tag_id, tag.tag_id)),
							),
					);
				}
			}
			for (let tag of dbtags) {
				if (!currentTags.find((t) => t.tag_id === tag.id)) {
					updates.push(tx.insert(postTagsTable).values({ post_id: newPost.id, tag_id: tag.id }));
				}
			}
			await Promise.all(updates);
		}

		return {
			op: "update",
			post: newPost,
		};
	}
}
