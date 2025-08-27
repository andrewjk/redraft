import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { listUsersTable, listsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";
import type { ListEditModel } from "./ListEditModel";

export default async function listSaveNew(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: ListEditModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		await transaction(db, async (tx) => {
			try {
				// Update the list in the database
				model.id = (
					await tx
						.insert(listsTable)
						.values({
							slug: uuid().toString(),
							name: model.name,
							description: model.description,
							created_at: new Date(),
							updated_at: new Date(),
						})
						.returning({ id: listsTable.id })
				)[0].id;

				// Add the list's users in the database
				// TODO: Is there a better way to do this?
				let updates = [];
				for (let listUser of model.users) {
					if (listUser.included) {
						updates.push(
							tx.insert(listUsersTable).values({
								list_id: model.id,
								user_id: listUser.id,
								created_at: new Date(),
								updated_at: new Date(),
							}),
						);
					}
				}
				await Promise.all(updates);
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
