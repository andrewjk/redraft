import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import createHeaderToken from "../utils/createHeaderToken";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function extensionFollowing(code: string, limit?: number, offset?: number) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the users that the user is following from the database
		// TODO: Maybe we should chunk this, and check only for updated users
		const followingQuery = db.query.followingTable.findMany({
			limit,
			offset,
			where: and(eq(followingTable.approved, true), isNull(followingTable.deleted_at)),
			columns: {
				url: true,
				shared_key: true,
			},
		});

		const [currentUser, followingData] = await Promise.all([currentUserQuery, followingQuery]);
		if (!currentUser) {
			return unauthorized();
		}

		const following = await Promise.all(
			followingData.map(async (f) => ({
				url: f.url,
				// NOTE: The token consists of our URL and the shared key, as it
				// will be sent from our extension to identify us to the user we
				// are following (who is reachable at `f.url`)
				token: await createHeaderToken({ url: currentUser.url, shared_key: f.shared_key }),
			})),
		);

		return ok({
			following,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
