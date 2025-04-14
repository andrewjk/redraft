import db from "@/data/db";
import { followingTable } from "@/data/schema";
import { ok, unauthorized } from "@torpor/build/response";
import { isNull } from "drizzle-orm";

export default async function extensionFollowing(limit?: number, offset?: number) {
	// Get the current (only) user
	const currentUser = await db.query.usersTable.findFirst();
	if (!currentUser) {
		return unauthorized();
	}

	// Get the users that the user is following from the database
	// TODO: Maybe we should chunk this, and check only for updated users
	const following = await db.query.followingTable.findMany({
		limit,
		offset,
		where: isNull(followingTable.deleted_at),
		columns: {
			url: true,
			shared_key: true,
		},
	});

	return ok({
		following,
	});
}
