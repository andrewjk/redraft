import { forbidden, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, userTokensTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

export default async function accountLogout(code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return forbidden();
		}

		// NOTE: We don't actually care if they are logged in or not...

		await db.transaction(async (tx) => {
			try {
				// Remove the user token
				// TODO: Allow logging out of all devices
				await tx.delete(userTokensTable).where(eq(userTokensTable.code, code));

				// Create an activity record
				await tx.insert(activityTable).values({
					url: user.url,
					text: "You logged out",
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
