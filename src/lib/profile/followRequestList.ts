import database from "@/data/database";
import { followedByTable, postsTable, usersTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FollowingRequest = {
	id: number;
	name: string;
	image: string;
};

export type FollowRequestList = {
	requests: FollowingRequest[];
	requestCount: number;
};

// TODO: Show both followedBy and following requests

export default async function followRequestList(
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
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			};
		});

		return ok({
			requests,
			requestCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
