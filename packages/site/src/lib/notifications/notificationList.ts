import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq, isNull } from "drizzle-orm";
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
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const condition = isNull(notificationsTable.deleted_at);

		// Get the follows from the database
		const notificationsQuery = db.query.notificationsTable.findMany({
			limit,
			offset,
			orderBy: desc(notificationsTable.updated_at),
			where: condition,
		});

		// Get the total count
		const notificationsCountQuery = db.$count(notificationsTable, condition);

		const [currentUser, notificationsData, notificationsCount] = await Promise.all([
			currentUserQuery,
			notificationsQuery,
			notificationsCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const notifications = notificationsData.map((f) => {
			return {
				url: f.url,
				text: f.text,
				createdAt: f.created_at,
			};
		});

		return ok({
			notifications,
			notificationsCount: notificationsCount,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
