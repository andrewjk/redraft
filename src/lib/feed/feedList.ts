import db from "@/data/db";
import { feedTable } from "@/data/schema";
import { desc, eq } from "drizzle-orm";
import feedPreview, { type FeedPreview } from "./feedPreview";

export default async function feedList(
	limit?: number,
	offset?: number,
	liked?: boolean,
	saved?: boolean,
): Promise<{ feed: FeedPreview[]; feedCount: number }> {
	// Get the current (only) user
	const user = await db.query.usersTable.findFirst();

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
	const feed = dbfeeds.map((post) => feedPreview(post, user!));

	return {
		feed,
		feedCount,
	};
}
