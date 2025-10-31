import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { notificationsTable, usersTable } from "../../data/schema";
import type NotificationPreviewModel from "../../types/notifications/NotificationPreviewModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function notificationList(
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

		const condition = isNull(notificationsTable.deleted_at);

		// Get the notifications from the database
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
		const notifications = notificationsData.map((n) => {
			return {
				id: n.id,
				url: n.url,
				text: n.text,
				read: n.read,
				createdAt: n.created_at,
			} as NotificationPreviewModel;
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
