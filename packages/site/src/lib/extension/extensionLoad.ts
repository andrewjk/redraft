import { ok, serverError, unauthorized } from "@torpor/build/response";
import { asc, desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import type ExtensionLoadModel from "../../types/extension/ExtensionLoadModel";
import type FollowingModel from "../../types/extension/FollowingModel";
import type ProfileModel from "../../types/extension/ProfileModel";
import createHeaderToken from "../utils/createHeaderToken";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function extensionLoad(code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the users that the user is following
		const followingQuery = db.query.followingTable.findMany({
			where: isNull(followingTable.deleted_at),
			orderBy: [desc(followingTable.approved), asc(followingTable.name)],
			columns: {
				url: true,
				name: true,
				image: true,
				shared_key: true,
				approved: true,
			},
		});

		const [currentUser, followingData] = await Promise.all([userQuery, followingQuery]);

		if (!currentUser) {
			return unauthorized();
		}

		const profile = {
			url: currentUser.url,
			email: currentUser.email,
			name: currentUser.name,
			bio: currentUser.bio,
			location: currentUser.location,
			image: currentUser.image,
		} satisfies ProfileModel;

		const following = await Promise.all(
			followingData.map(
				async (f) =>
					({
						approved: f.approved,
						url: f.url,
						name: f.name,
						image: f.image,
						// NOTE: The token consists of our URL and the shared key, as it
						// will be sent from our extension to identify us to the user we
						// are following (who is reachable at `f.url`)
						token: await createHeaderToken({
							url: currentUser.url,
							shared_key: f.shared_key,
						}),
					}) satisfies FollowingModel,
			),
		);

		return ok({
			profile,
			following,
			notificationCount: currentUser.notification_count,
			messageCount: currentUser.message_count,
		} satisfies ExtensionLoadModel);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
