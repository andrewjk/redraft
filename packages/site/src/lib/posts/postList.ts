import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import database from "../../data/database";
import { postsTable, usersTable } from "../../data/schema";
import { User } from "../../data/schema/usersTable";
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
	let errorMessage: string | undefined;

	try {
		const db = database();

		if (drafts) {
			const draftsUser = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, userIdQuery(code!)),
			});
			if (!draftsUser) {
				return unauthorized();
			}
		}

		// Get the current (only) user
		const currentUserQuery = db.query.usersTable.findFirst();

		const condition = and(
			isNull(postsTable.parent_id),
			isNull(postsTable.deleted_at),
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
		const postsQuery = db.query.postsTable.findMany({
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
		const postsCountQuery = db.$count(postsTable, condition);

		const [currentUser, postsData, postsCount] = await Promise.all([
			currentUserQuery,
			postsQuery,
			postsCountQuery,
		]);
		if (!currentUser) {
			return notFound();
		}

		// Create post previews
		const posts = postsData.map((post) => postPreview(post, currentUser!));

		return ok({
			posts,
			postsCount,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
