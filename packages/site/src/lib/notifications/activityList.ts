import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type ActivityPreview = {
	name: string;
	image: string;
};

export type ActivityList = {
	activity: ActivityPreview[];
	activityCount: number;
};

export default async function activityList(
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

		const condition = isNull(activityTable.deleted_at);

		// Get the follows from the database
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
		const activity = activityData.map((f) => {
			return {
				url: f.url,
				text: f.text,
				createdAt: f.created_at,
			};
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
