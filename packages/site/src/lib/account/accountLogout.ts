import { ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { userTokensTable } from "../../data/schema/userTokensTable";
import getErrorMessage from "../utils/getErrorMessage";

export default async function accountLogout(code: string) {
	try {
		const db = database();

		// NOTE: Actually, we don't care if they have a token...
		// Get the current user
		//const currentUser = await db.query.usersTable.findFirst({
		//	where: eq(usersTable.id, userIdQuery(code)),
		//});
		//if (!currentUser) {
		//	return unauthorized();
		//}

		// Remove the user token
		// TODO: Allow logging out of all devices
		await db.delete(userTokensTable).where(eq(userTokensTable.code, code));

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
