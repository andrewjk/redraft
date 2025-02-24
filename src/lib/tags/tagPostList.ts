import db from "@/data/db";
import { postTagsTable, postsTable, tagsTable } from "@/data/schema";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import postPreview, { PostPreview } from "../posts/postPreview";

export default async function tagPostList(
	slug: string,
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<{ tag: { slug: string; text: string }; posts: PostPreview[]; postsCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();
	//if (!user) {
	//	return notFound();
	//}

	const tag = await db.query.tagsTable.findFirst({ where: eq(tagsTable.slug, slug) });
	//if (!tag) {
	//	return notFound();
	//}

	const condition = and(
		eq(postTagsTable.tag_id, tag!.id),
		// HACK: Can't filter directly by one-to-one relations with Drizzle
		inArray(
			postTagsTable.post_id,
			db
				.select({ id: postsTable.id })
				.from(postsTable)
				.where(drafts ? isNull(postsTable.published_at) : isNotNull(postsTable.published_at)),
		),
	);

	// Get the tags from the database
	const dbposttags = await db.query.postTagsTable.findMany({
		limit,
		offset,
		where: condition,
		// HACK: Should be ordering by post date...
		orderBy: desc(postTagsTable.post_id),
		with: {
			post: true,
		},
	});

	// Get the total tag count
	const postsCount = await db.$count(postTagsTable, condition);

	// Create tag previews
	const posts = dbposttags.map((pt) => postPreview(pt.post, user!));

	return {
		tag: { slug: tag!.slug, text: tag!.text },
		posts,
		postsCount,
	};
}
