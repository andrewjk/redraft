import database from "@/data/database";
import { articlesTable, postTagsTable, tagsTable } from "@/data/schema";
import { Post, postsTable } from "@/data/schema/postsTable";
import { Tag } from "@/data/schema/tagsTable";
import { ARTICLE_POST_TYPE } from "@/lib/constants";
import { and, eq, inArray } from "drizzle-orm";
import sluggify from "../utils/sluggify";
import uuid from "../utils/uuid";
import { PostEditModel } from "./postEdit";

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
	if (model.type === ARTICLE_POST_TYPE) {
		const article = {
			text: model.articleText!,
			created_at: new Date(),
			updated_at: new Date(),
		};
		if (!model.articleId && model.articleId !== 0) {
			model.articleId = (
				await db.insert(articlesTable).values(article).returning({ id: articlesTable.id })
			)[0].id;
		} else {
			await db.update(articlesTable).set(article).where(eq(articlesTable.id, model.articleId!));
		}
	}

	// Create or update the post
	if (model.id < 0) {
		const post = {
			slug: model.type === ARTICLE_POST_TYPE ? sluggify(model.title!) : uuid(),
			text: model.text,
			visibility: model.visibility || 0,
			type: model.type || 0,
			image: model.image,
			articleId: model.articleId,
			url: model.url,
			title: model.title,
			publication: model.publication,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const newPost = (await db.insert(postsTable).values(post).returning())[0];
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
		const post = {
			slug: model.type === ARTICLE_POST_TYPE ? sluggify(model.title!) : undefined,
			text: model.text,
			visibility: model.visibility || 0,
			type: model.type || 0,
			image: model.image,
			articleId: model.articleId,
			url: model.url,
			title: model.title,
			publication: model.publication,
			updated_at: new Date(),
		};
		const newPost = (
			await db.update(postsTable).set(post).where(eq(postsTable.id, model.id)).returning()
		)[0];
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
