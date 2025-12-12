import { badRequest, forbidden, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type ChangePasswordModel from "../../types/account/ChangePasswordModel";
import ChangePasswordSchema from "../../types/account/ChangePasswordSchema";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash, hashPassword } from "../utils/hashPasswords";
import userIdQuery from "../utils/userIdQuery";

export default async function accountChangePassword(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		let model: ChangePasswordModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(ChangePasswordSchema, model);
		if (!validated.success) {
			model.oldPassword = "";
			model.password = "";
			model.confirmPassword = "";
			const message = validated.issues.map((e) => e.message).join("\n");
			console.log("ERROR", message);
			return badRequest({
				message,
				data: model,
			});
		}
		model = validated.output;

		// Get the current user
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!user) {
			return unauthorized();
		}

		// Compare the given password with the one stored
		if (!user || !compareWithHash(model.oldPassword.trim(), user.password)) {
			model.oldPassword = "";
			model.password = "";
			model.confirmPassword = "";
			return forbidden({
				message: "Invalid password",
				data: model,
			});
		}

		const password = hashPassword(model.password.trim());
		await transaction(db, async (tx) => {
			try {
				// Update the user
				await tx.update(usersTable).set({ password }).where(eq(usersTable.id, user.id));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: user.url,
					text: "You changed your password",
					created_at: new Date(),
					updated_at: new Date(),
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
