import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { listsTable, usersTable } from "../../data/schema";
import type ListPreviewModel from "../../types/contacts/ListPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function listList(
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

		const condition = isNull(listsTable.deleted_at);

		// Get the lists from the database
		const listsQuery = db.query.listsTable.findMany({
			limit,
			offset,
			orderBy: listsTable.name,
			where: condition,
		});

		// Get the total count
		const listsCountQuery = db.$count(listsTable, condition);

		const [currentUser, listsData, listsCount] = await Promise.all([
			currentUserQuery,
			listsQuery,
			listsCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const lists = listsData.map((l) => {
			return {
				id: l.id,
				slug: l.slug,
				name: l.name,
				description: l.description,
			} satisfies ListPreviewModel;
		});

		const result = {
			lists,
			listsCount,
		};

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
