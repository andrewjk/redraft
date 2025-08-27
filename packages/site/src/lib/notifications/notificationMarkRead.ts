import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { notificationsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type MarkReadModel = {
	id: number;
	read: boolean;
};

export default async function notificationMarkRead(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: MarkReadModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		await transaction(db, async (tx) => {
			try {
				// Mark the notification read
				await tx
					.update(notificationsTable)
					.set({
						read: model.read,
					})
					.where(eq(notificationsTable.id, model.id));

				await tx.update(usersTable).set({
					notification_count: tx.$count(notificationsTable, eq(notificationsTable.read, false)),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
