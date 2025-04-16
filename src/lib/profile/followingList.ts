import database from "@/data/database";
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
	const db = database();

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
			id: f.id,
			url: `${f.url}api/follow/login?sharedkey=${f.shared_key}`,
			name: f.name,
			image: f.image,
			bio: f.bio,
		};
	});

	return {
		following,
		followingCount,
	};
}
