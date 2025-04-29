import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import createHeaderToken from "../utils/createHeaderToken";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function extensionFollowing(code: string, limit?: number, offset?: number) {
	try {
		const db = database();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Get the users that the user is following from the database
		// TODO: Maybe we should chunk this, and check only for updated users
		const following = (
			await db.query.followingTable.findMany({
				limit,
				offset,
				where: isNull(followingTable.deleted_at),
				columns: {
					url: true,
					shared_key: true,
				},
			})
		).map((f) => ({
			url: f.url,
			token: createHeaderToken(f),
		}));

		return ok({
			following,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
