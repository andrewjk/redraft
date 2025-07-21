import { forbidden, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable } from "../../data/schema/activityTable";
import { userTokensTable } from "../../data/schema/userTokensTable";
import getErrorMessage from "../utils/getErrorMessage";

export default async function accountLogout(code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const user = await tx.query.usersTable.findFirst();
				if (!user) {
					return forbidden();
				}

				// NOTE: Actually, we don't care if they have a token...
				// Get the current user
				//const currentUser = await tx.query.usersTable.findFirst({
				//	where: eq(usersTable.id, userIdQuery(code)),
				//});
				//if (!currentUser) {
				//	return unauthorized();
				//}

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

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
