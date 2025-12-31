import { notFound, ok, serverError } from "@torpor/build/response";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import database from "../../data/database";
import { postTagsTable, postsTable, tagsTable } from "../../data/schema";
import postPreview from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";

export default async function tagPostList(
	slug: string,
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst();

		// Get the tags
		const tagQuery = db.query.tagsTable.findFirst({ where: eq(tagsTable.slug, slug) });

		const [user, tag] = await Promise.all([userQuery, tagQuery]);

		if (!user) {
			return notFound();
		}
		if (!tag) {
			return notFound();
		}

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

		// Get the posts from the database
		const tagPostsQuery = db.query.postTagsTable.findMany({
			limit,
			offset,
			where: condition,
			// HACK: Should be ordering by post date...
			orderBy: desc(postTagsTable.post_id),
			with: {
				post: {
					with: {
						postTags: {
							with: {
								tag: true,
							},
						},
					},
				},
			},
		});

		// Get the total post count
		const postsCountQuery = db.$count(postTagsTable, condition);

		const [tagPosts, postsCount] = await Promise.all([tagPostsQuery, postsCountQuery]);

		// Create post previews
		const posts = tagPosts.map((pt) => postPreview(pt.post, user));

		return ok({
			tag: { slug: tag!.slug, text: tag!.text },
			posts,
			postsCount,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
