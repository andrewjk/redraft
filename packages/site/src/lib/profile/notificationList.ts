import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq } from "drizzle-orm";
import database from "../../data/database";
import { notificationsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type NotificationPreview = {
	name: string;
	image: string;
};

export type NotificationList = {
	notifications: NotificationPreview[];
	notificationsCount: number;
};

export default async function notificationList(
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
		const dbnotifications = await db.query.notificationsTable.findMany({
			limit,
			offset,
			orderBy: desc(notificationsTable.updated_at),
		});

		// Get the total count
		const notificationsCount = await db.$count(notificationsTable);

		// Create views
		const notifications = dbnotifications.map((f) => {
			return {
				url: f.url,
				text: f.text,
			};
		});

		return ok({
			notifications,
			notificationsCount: notificationsCount,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
