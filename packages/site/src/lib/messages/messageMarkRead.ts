import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { messagesTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type MarkReadModel from "../../types/messages/MarkReadModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function messageMarkRead(request: Request, code: string) {
	let errorMessage = "";

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
				// Mark the message read
				await tx
					.update(messagesTable)
					.set({
						read: model.read,
					})
					.where(eq(messagesTable.id, model.id));

				await tx.update(usersTable).set({
					message_count: tx.$count(messagesTable, eq(messagesTable.read, false)),
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
