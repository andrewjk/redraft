import db from "@/data/db";
import { followedByTable, postsTable } from "@/data/schema";
import { desc, eq } from "drizzle-orm";

export type FollowedByPreview = {
	name: string;
	image: string;
};

export default async function followedByList(
	limit?: number,
	offset?: number,
): Promise<{ followedBy: FollowedByPreview[]; followedByCount: number }> {
	// Get the follows from the database
	const dbfollowedBy = await db.query.followedByTable.findMany({
		limit,
		offset,
		orderBy: desc(postsTable.updated_at),
		where: eq(followedByTable.approved, true),
	});

	// Get the total count
	const followedByCount = await db.$count(followedByTable);

	// Create views
	const followedBy = dbfollowedBy.map((f) => {
		return {
			name: f.name,
			image: f.image,
		};
	});

	return {
		followedBy,
		followedByCount,
	};
}
