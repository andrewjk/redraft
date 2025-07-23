import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import feedPreview, { type FeedPreview } from "./feedPreview";

export type FeedList = {
	feed: FeedPreview[];
	feedCount: number;
};

export default async function feedList(
	code: string,
	limit?: number,
	offset?: number,
	liked?: boolean,
	saved?: boolean,
): Promise<Response> {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const where = liked ? eq(feedTable.liked, true) : saved ? eq(feedTable.saved, true) : undefined;

		// Get the feed from the database
		const feedsQuery = db.query.feedTable.findMany({
			limit,
			offset,
			orderBy: desc(feedTable.updated_at),
			with: { user: true },
			where,
		});

		// Get the total post count
		const feedCountQuery = db.$count(feedTable, where);

		const [currentUser, feeds, feedCount] = await Promise.all([
			currentUserQuery,
			feedsQuery,
			feedCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create post previews
		const feed = feeds.map((post) => feedPreview(post, currentUser!));

		return ok({
			feed,
			feedCount,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
