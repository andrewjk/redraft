import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { listUsersTable, listsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type ListEditModel from "../../types/contacts/ListEditModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function listSave(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: ListEditModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the list
		const listQuery = db.query.listsTable.findFirst({
			where: eq(listsTable.id, model.id),
			with: {
				users: true,
			},
		});

		const [currentUser, list] = await Promise.all([currentUserQuery, listQuery]);
		if (!currentUser) {
			return unauthorized();
		}
		if (!list) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Update the list in the database
				await tx
					.update(listsTable)
					.set({
						name: model.name,
						description: model.description,
						updated_at: new Date(),
					})
					.where(eq(listsTable.id, model.id));

				// Delete and add the list's users in the database
				// TODO: Is there a better way to do this?
				let updates = [];
				for (let listUser of list.users) {
					if (!model.users.find((l) => l.id === listUser.user_id && l.included)) {
						updates.push(tx.delete(listUsersTable).where(eq(listUsersTable.id, listUser.id)));
					}
				}
				for (let listUser of model.users) {
					if (listUser.included && !list.users.find((l) => l.user_id === listUser.id)) {
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
