import { and, eq, inArray } from "drizzle-orm";
import database from "../../data/database";
import { articlesTable, postTagsTable, tagsTable } from "../../data/schema";
import { Post, postsTable } from "../../data/schema/postsTable";
import { Tag } from "../../data/schema/tagsTable";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import { type PostEditModel } from "./postEdit";

export default async function postCreateOrUpdate(model: PostEditModel): Promise<{
	op: "create" | "update";
	post: Post;
}> {
	const db = database();

	// Create tags, if applicable
	let dbtags: Tag[] = [];
	if (model.tags) {
		let tags = model.tags.split(";").map((t) => t.trim());
		dbtags = await db.query.tagsTable.findMany({
			where: inArray(tagsTable.text, tags),
		});
		for (let tag of tags) {
			if (!dbtags.find((t) => t.text === tag)) {
				dbtags.push(
					(
						await db
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
				await db
					.insert(articlesTable)
					.values({
						text: model.articleText!,
						created_at: new Date(),
						updated_at: new Date(),
					})
					.returning({ id: articlesTable.id })
			)[0].id;
		} else {
			await db
				.update(articlesTable)
				.set({
					text: model.articleText!,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(articlesTable.id, model.articleId!));
		}
	}

	// Create or update the post
	if (model.id < 0) {
		const newPost = (
			await db
				.insert(postsTable)
				.values({
					slug: model.isArticle ? sluggify(model.linkTitle!) : uuid(),
					text: model.text,
					visibility: model.visibility || 0,
					image: model.hasImage ? model.image : null,
					is_article: model.isArticle,
					article_id: model.isArticle ? model.articleId : null,
					link_url: model.hasLink || model.isArticle ? model.linkUrl : null,
					link_title: model.hasLink || model.isArticle ? model.linkTitle : null,
					link_image: model.hasLink || model.isArticle ? model.linkImage : null,
					link_publication: model.hasLink || model.isArticle ? model.linkPublication : null,
					child_count: model.children?.length ?? 0,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning()
		)[0];
		if (model.children?.length) {
			for (let child of model.children) {
				await db.insert(postsTable).values({
					slug: uuid(),
					text: child.text,
					image: child.hasImage ? child.image : null,
					link_url: child.hasLink ? child.linkUrl : null,
					link_title: child.hasLink ? child.linkTitle : null,
					link_image: child.hasLink ? child.linkImage : null,
					link_publication: child.hasLink ? child.linkPublication : null,
					parent_id: newPost.id,
					created_at: new Date(),
					updated_at: new Date(),
				});
			}
		}
		if (dbtags.length) {
			await db
				.insert(postTagsTable)
				.values(dbtags.map((t) => ({ post_id: newPost.id, tag_id: t.id })));
		}
		return {
			op: "create",
			post: newPost,
		};
	} else {
		const newPost = (
			await db
				.update(postsTable)
				.set({
					slug: model.isArticle ? sluggify(model.linkTitle!) : undefined,
					text: model.text,
					visibility: model.visibility || 0,
					image: model.hasImage ? model.image : null,
					is_article: model.isArticle,
					article_id: model.isArticle ? model.articleId : null,
					link_url: model.hasLink ? model.linkUrl : null,
					link_title: model.hasLink || model.isArticle ? model.linkTitle : null,
					link_image: model.hasLink || model.isArticle ? model.linkImage : null,
					link_publication: model.hasLink ? model.linkPublication : null,
					child_count: model.children?.length ?? 0,
					updated_at: new Date(),
				})
				.where(eq(postsTable.id, model.id))
				.returning()
		)[0];
		if (model.children?.length) {
			// Update the children in the database
			const currentChildren = await db.query.postsTable.findMany({
				where: eq(postsTable.parent_id, newPost.id),
			});
			let updates = [];
			for (let child of currentChildren) {
				if (!model.children.find((c) => c.id === child.id)) {
					updates.push(
						db
							.update(postsTable)
							.set({ deleted_at: new Date() })
							.where(eq(postsTable.id, child.id)),
					);
				}
			}
			for (let child of model.children) {
				const dbchild = currentChildren.find((c) => c.id === child.id);
				if (dbchild) {
					updates.push(
						db
							.update(postsTable)
							.set({
								text: child.text,
								// TODO: Allow hiding child posts
								//visibility: child.visibility || 0,
								image: child.hasImage ? child.image : null,
								link_url: child.hasLink ? child.linkUrl : null,
								link_title: child.hasLink ? child.linkTitle : null,
								link_image: child.hasLink ? child.linkImage : null,
								link_publication: child.hasLink ? child.linkPublication : null,
								updated_at: new Date(),
							})
							.where(eq(postsTable.id, child.id)),
					);
				} else {
					updates.push(
						db.insert(postsTable).values({
							slug: uuid(),
							text: child.text,
							// TODO: Allow hiding child posts
							//visibility: child.visibility || 0,
							image: child.hasImage ? child.image : null,
							link_url: child.hasLink ? child.linkUrl : null,
							link_title: child.hasLink ? child.linkTitle : null,
							link_image: child.hasLink ? child.linkImage : null,
							link_publication: child.hasLink ? child.linkPublication : null,
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
			const currentTags = await db.query.postTagsTable.findMany({
				where: eq(postTagsTable.post_id, newPost.id),
			});
			let updates = [];
			for (let tag of currentTags) {
				if (!dbtags.find((t) => t.id === tag.tag_id)) {
					updates.push(
						db
							.delete(postTagsTable)
							.where(
								and(eq(postTagsTable.post_id, tag.post_id), eq(postTagsTable.tag_id, tag.tag_id)),
							),
					);
				}
			}
			for (let tag of dbtags) {
				if (!currentTags.find((t) => t.tag_id === tag.id)) {
					updates.push(db.insert(postTagsTable).values({ post_id: newPost.id, tag_id: tag.id }));
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
