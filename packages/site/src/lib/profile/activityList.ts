import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq } from "drizzle-orm";
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
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Get the follows from the database
		const dbactivity = await db.query.activityTable.findMany({
			limit,
			offset,
			orderBy: desc(activityTable.updated_at),
		});

		// Get the total count
		const activityCount = await db.$count(activityTable);

		// Create views
		const activity = dbactivity.map((f) => {
			return {
				url: f.url,
				text: f.text,
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
