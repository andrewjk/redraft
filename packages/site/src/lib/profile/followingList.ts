import database from "@/data/database";
import { followingTable, postsTable, usersTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FollowingPreview = {
	name: string;
	image: string;
};

export type FollowingList = {
	following: FollowingPreview[];
	followingCount: number;
};

export default async function followingList(
	code: string,
	limit?: number,
	offset?: number,
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
				url: f.url, // `${f.url}api/follow/login?sharedkey=${f.shared_key}`,
				name: f.name,
				image: f.image,
				bio: f.bio,
			};
		});

		return ok({
			following,
			followingCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
