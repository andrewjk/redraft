import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import type ActivityPreviewModel from "../../types/notifications/ActivityPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function activityList(
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

		const condition = isNull(activityTable.deleted_at);

		// Get the activity from the database
		const activityQuery = db.query.activityTable.findMany({
			limit,
			offset,
			orderBy: desc(activityTable.updated_at),
			where: condition,
		});

		// Get the total count
		const activityCountQuery = db.$count(activityTable, condition);

		const [currentUser, activityData, activityCount] = await Promise.all([
			currentUserQuery,
			activityQuery,
			activityCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const activity = activityData.map((a) => {
			return {
				url: a.url,
				text: a.text,
				createdAt: a.created_at,
			} as ActivityPreviewModel;
		});

		return ok({
			activity,
			activityCount: activityCount,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
