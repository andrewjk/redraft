import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FollowedByPreview = {
	name: string;
	image: string;
};

export type FollowedByList = {
	followedBy: FollowedByPreview[];
	followedByCount: number;
};

export default async function followedByList(
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
		const dbfollowedBy = await db.query.followedByTable.findMany({
			limit,
			offset,
			orderBy: desc(followedByTable.updated_at),
			where: and(
				eq(followedByTable.approved, true),
				isNull(followedByTable.blocked_at),
				isNull(followedByTable.deleted_at),
			),
		});

		// Get the total count
		const followedByCount = await db.$count(followedByTable);

		// Create views
		const followedBy = dbfollowedBy.map((f) => {
			return {
				id: f.id,
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			};
		});

		return ok({
			followedBy,
			followedByCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
