import { ok, serverError } from "@torpor/build/response";
import { and, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

export type FollowingPreview = {
	name: string;
	image: string;
};

export type FollowingList = {
	following: FollowingPreview[];
	followingCount: number;
};

export default async function followingList(
	// @ts-ignore we may use this to allow setting following to private
	code?: string,
	limit?: number,
	offset?: number,
): Promise<Response> {
	try {
		const db = database();

		//// Get the current user
		//const currentUser = await db.query.usersTable.findFirst({
		//	where: eq(usersTable.id, userIdQuery(code)),
		//});
		//if (!currentUser) {
		//	return unauthorized();
		//}

		// Get the follows from the database
		const dbfollowing = await db.query.followingTable.findMany({
			limit,
			offset,
			orderBy: desc(followingTable.updated_at),
			where: and(eq(followingTable.approved, true), isNull(followingTable.deleted_at)),
		});

		// Get the total count
		const followingCount = await db.$count(followingTable);

		// Create views
		const following = dbfollowing.map((f) => {
			return {
				id: f.id,
				url: f.url,
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
