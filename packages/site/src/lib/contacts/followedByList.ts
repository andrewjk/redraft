import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import type FollowedByListModel from "../../types/contacts/FollowedByListModel";
import type FollowedByPreviewModel from "../../types/contacts/FollowedByPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";

export default async function followedByList(
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
			eq(followedByTable.approved, true),
			isNull(followedByTable.blocked_at),
			isNull(followedByTable.deleted_at),
		);

		// Get the follows from the database
		const followedByQuery = db.query.followedByTable.findMany({
			limit,
			offset,
			orderBy: desc(followedByTable.updated_at),
			where: condition,
		});

		// Get the total count
		const followedByCountQuery = db.$count(followedByTable, condition);

		const [currentUser, followedByData, followedByCount] = await Promise.all([
			currentUserQuery,
			followedByQuery,
			followedByCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// HACK: set slugs if they haven't been set -- this can be removed in a few versions
		for (let f of followedByData) {
			if (!f.slug) {
				f.slug = uuid();
				await db.update(followedByTable).set({ slug: f.slug }).where(eq(followedByTable.id, f.id));
			}
		}

		// Create views
		const followedBy = followedByData.map((f) => {
			return {
				slug: f.slug,
				url: f.url,
				name: f.name,
				image: f.image,
				bio: f.bio,
			} satisfies FollowedByPreviewModel;
		});

		const result = {
			followedBy,
			followedByCount,
		} satisfies FollowedByListModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
