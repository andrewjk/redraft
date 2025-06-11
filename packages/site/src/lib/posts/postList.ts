import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import database from "../../data/database";
import { postsTable } from "../../data/schema";
import { User, usersTable } from "../../data/schema/usersTable";
import {
	ARTICLE_POST_TYPE,
	FOLLOWER_POST_VISIBILITY,
	IMAGE_POST_TYPE,
	LINK_POST_TYPE,
	PUBLIC_POST_VISIBILITY,
} from "../constants";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postPreview, { type PostPreview } from "./postPreview";

export type PostList = {
	posts: PostPreview[];
	postsCount: number;
};

export async function postList(user?: User, follower?: User, limit?: number, offset?: number) {
	return await getPosts(false, undefined, user, follower, limit, offset);
}

export async function draftPostList(
	code: string,
	user?: User,
	follower?: User,
	limit?: number,
	offset?: number,
) {
	return await getPosts(true, undefined, user, follower, limit, offset, code);
}

export async function getPosts(
	drafts: boolean,
	type?: number,
	user?: User,
	follower?: User,
	limit?: number,
	offset?: number,
	code?: string,
): Promise<Response> {
	try {
		const db = database();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return notFound();
		}

		if (drafts) {
			const draftsUser = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, userIdQuery(code!)),
			});
			if (!draftsUser) {
				return unauthorized();
			}
		}

		const condition = and(
			isNull(postsTable.parent_id),
			drafts ? isNull(postsTable.published_at) : isNotNull(postsTable.published_at),
			type === IMAGE_POST_TYPE ? isNotNull(postsTable.image) : undefined,
			type === ARTICLE_POST_TYPE ? eq(postsTable.is_article, true) : undefined,
			type === LINK_POST_TYPE
				? and(isNotNull(postsTable.link_url), eq(postsTable.is_article, false))
				: undefined,
			// Logged in users can see any post
			// Logged in followers can see public or follower posts
			// Non-logged in users can only see public posts
			user
				? undefined
				: follower
					? or(
							eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
							eq(postsTable.visibility, FOLLOWER_POST_VISIBILITY),
						)
					: eq(postsTable.visibility, PUBLIC_POST_VISIBILITY),
		);

		// Get the posts from the database
		const dbposts = await db.query.postsTable.findMany({
			limit,
			offset,
			where: condition,
			orderBy: [desc(postsTable.pinned), desc(postsTable.updated_at)],
			with: {
				postTags: {
					with: {
						tag: true,
					},
				},
			},
		});

		// Get the total post count
		const postsCount = await db.$count(postsTable, condition);

		// Create post previews
		const posts = dbposts.map((post) => postPreview(post, currentUser!));

		return ok({
			posts,
			postsCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
