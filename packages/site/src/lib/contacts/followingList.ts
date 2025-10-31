import { ok, serverError } from "@torpor/build/response";
import { and, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import type FollowingListModel from "../../types/contacts/FollowingListModel";
import type FollowingPreviewModel from "../../types/contacts/FollowingPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import uuid from "../utils/uuid";

export default async function followingList(
	// @ts-ignore we may use this to allow setting following to private
	code?: string,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage = "";

	try {
		const db = database();

		//// Get the current user
		//const currentUser = await db.query.usersTable.findFirst({
		//	where: eq(usersTable.id, userIdQuery(code)),
		//});
		//if (!currentUser) {
		//	return unauthorized();
		//}

		const condition = and(eq(followingTable.approved, true), isNull(followingTable.deleted_at));

		// Get the follows from the database
		const followingQuery = db.query.followingTable.findMany({
			limit,
			offset,
			orderBy: desc(followingTable.updated_at),
			where: condition,
		});

		// Get the total count
		const followingCountQuery = db.$count(followingTable, condition);

		const [followingData, followingCount] = await Promise.all([
			followingQuery,
			followingCountQuery,
		]);

		// HACK: set slugs if they haven't been set -- this can be removed in a few versions
		for (let f of followingData) {
			if (!f.slug) {
				f.slug = uuid();
				await db.update(followingTable).set({ slug: f.slug }).where(eq(followingTable.id, f.id));
			}
		}

		// Create views
		const following = followingData.map((f) => {
			return {
				slug: f.slug,
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			} satisfies FollowingPreviewModel;
		});

		const result = {
			following,
			followingCount,
		} satisfies FollowingListModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
