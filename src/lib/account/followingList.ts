import db from "@/data/db";
import { followingTable, postsTable } from "@/data/schema";
import { desc, eq } from "drizzle-orm";

export type FollowingPreview = {
	name: string;
	image: string;
};

export default async function followingList(
	limit?: number,
	offset?: number,
): Promise<{ following: FollowingPreview[]; followingCount: number }> {
	// Get the follows from the database
	const dbfollowing = await db.query.followingTable.findMany({
		limit,
		offset,
		orderBy: desc(postsTable.updated_at),
		where: eq(followingTable.approved, true),
	});

	// Get the total count
	const followingCount = await db.$count(followingTable);

	// Create views
	const following = dbfollowing.map((f) => {
		return {
			name: f.name,
			image: f.image,
		};
	});

	return {
		following,
		followingCount,
	};
}
