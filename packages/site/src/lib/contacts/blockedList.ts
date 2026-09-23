import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import type BlockedListModel from "../../types/contacts/BlockedListModel";
import type FollowedByPreviewModel from "../../types/contacts/FollowedByPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function blockedList(
	code: string,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const condition = and(
			isNotNull(followedByTable.blocked_at),
			isNull(followedByTable.deleted_at),
		);

		// Get the blocked users from the database
		const blockedQuery = db.query.followedByTable.findMany({
			limit,
			offset,
			orderBy: desc(followedByTable.updated_at),
			where: condition,
		});

		// Get the total count
		const blockedCountQuery = db.$count(followedByTable, condition);

		const [currentUser, blockedData, blockedCount] = await Promise.all([
			currentUserQuery,
			blockedQuery,
			blockedCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const blocked = blockedData.map((f) => {
			return {
				slug: f.slug,
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			} satisfies FollowedByPreviewModel;
		});

		const result = {
			blocked,
			blockedCount,
		} satisfies BlockedListModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
