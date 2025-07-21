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
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				// Get the current user
				const currentUser = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, userIdQuery(code)),
				});
				if (!currentUser) {
					return unauthorized();
				}

				// Get the follows from the database
				const dbnotifications = await tx.query.notificationsTable.findMany({
					limit,
					offset,
					orderBy: desc(notificationsTable.updated_at),
				});

				// Get the total count
				const notificationsCount = await tx.$count(notificationsTable);

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
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
