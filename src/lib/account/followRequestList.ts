import db from "@/data/db";
import { followedByTable, postsTable } from "@/data/schema";
import { desc, eq } from "drizzle-orm";

export type FollowingPreview = {
	id: number;
	name: string;
	image: string;
};

export default async function followRequestList(
	limit?: number,
	offset?: number,
): Promise<{ requests: FollowingPreview[]; requestCount: number }> {
	// Get the follows from the database
	const dbawaiting = await db.query.followedByTable.findMany({
		limit,
		offset,
		orderBy: desc(postsTable.updated_at),
		where: eq(followedByTable.approved, false),
	});

	// Get the total count
	const requestCount = await db.$count(followedByTable);

	// Create views
	const requests = dbawaiting.map((f) => {
		return {
			id: f.id,
			name: f.name,
			image: f.image,
		};
	});

	return {
		requests,
		requestCount,
	};
}
