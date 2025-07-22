import { notFound, ok, serverError } from "@torpor/build/response";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import database from "../../data/database";
import { postTagsTable, postsTable, tagsTable } from "../../data/schema";
import postPreview, { PostPreview } from "../posts/postPreview";
import getErrorMessage from "../utils/getErrorMessage";

export type TagPostList = {
	tag: { slug: string; text: string };
	posts: PostPreview[];
	postsCount: number;
};

export default async function tagPostList(
	slug: string,
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		const tag = await db.query.tagsTable.findFirst({ where: eq(tagsTable.slug, slug) });
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
		const dbposttags = await db.query.postTagsTable.findMany({
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
		const postsCount = await db.$count(postTagsTable, condition);

		// Create post previews
		const posts = dbposttags.map((pt) => postPreview(pt.post, user!));

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
