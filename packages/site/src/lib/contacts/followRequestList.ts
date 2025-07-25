import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type FollowRequestPreview = {
	url: string;
	name: string;
	image: string;
	bio: string;
};

export type FollowRequestList = {
	requests: FollowRequestPreview[];
	requestCount: number;
};

// TODO: Show both followedBy and following requests

export default async function followRequestList(
	code: string,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const condition = and(eq(followedByTable.approved, false), isNull(followedByTable.deleted_at));

		// Get the follows from the database
		const requestQuery = db.query.followedByTable.findMany({
			limit,
			offset,
			orderBy: desc(followedByTable.updated_at),
			where: condition,
		});

		// Get the total count
		const requestCountQuery = db.$count(followedByTable, condition);

		const [currentUser, requestData, requestCount] = await Promise.all([
			currentUserQuery,
			requestQuery,
			requestCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const requests = requestData.map((f) => {
			return {
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			} satisfies FollowRequestPreview;
		});

		const result = {
			requests,
			requestCount,
		} satisfies FollowRequestList;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
