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
	try {
		const db = database();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		const where = liked ? eq(feedTable.liked, true) : saved ? eq(feedTable.saved, true) : undefined;

		// Get the feed from the database
		const dbfeeds = await db.query.feedTable.findMany({
			limit,
			offset,
			orderBy: desc(feedTable.updated_at),
			with: { user: true },
			where,
		});

		// Get the total post count
		const feedCount = await db.$count(feedTable, where);

		// Create post previews
		const feed = dbfeeds.map((post) => feedPreview(post, currentUser!));

		return ok({
			feed,
			feedCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
