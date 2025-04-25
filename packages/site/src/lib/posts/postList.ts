import database from "@/data/database";
import { postsTable } from "@/data/schema";
import { User } from "@/data/schema/usersTable";
import { FOLLOWER_POST_VISIBILITY, PUBLIC_POST_VISIBILITY } from "@/lib/constants";
import { notFound, ok, serverError } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import postPreview, { type PostPreview } from "./postPreview";

export type PostList = {
	posts: PostPreview[];
	postsCount: number;
};

export default async function postList(
	user: User,
	follower: User,
	drafts: boolean,
	limit?: number,
	offset?: number,
): Promise<Response> {
	try {
		const db = database();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return notFound();
		}

		const condition = and(
			drafts ? isNull(postsTable.published_at) : isNotNull(postsTable.published_at),
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
