import { badRequest, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { listUsersTable, listsTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type ListEditModel from "../../types/contacts/ListEditModel";
import ListEditSchema from "../../types/contacts/ListEditSchema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";

export default async function listSaveNew(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: ListEditModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(ListEditSchema, model);
		if (!validated.success) {
			return badRequest({
				message: validated.issues.map((e) => e.message).join("\n"),
				data: model,
			});
		}

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized({
				message: "Unauthorized",
				data: model,
			});
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
