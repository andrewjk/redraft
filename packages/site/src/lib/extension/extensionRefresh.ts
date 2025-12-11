import { ok, serverError, unauthorized } from "@torpor/build/response";
import { asc, desc, eq, gt } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import type ExtensionRefreshModel from "../../types/extension/ExtensionRefreshModel";
import type FollowingModel from "../../types/extension/FollowingModel";
import type ProfileModel from "../../types/extension/ProfileModel";
import createHeaderToken from "../utils/createHeaderToken";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function extensionRefresh(from: number, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const since = new Date(from);

		// Get the current user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the users that the user is following, and that have been updated
		const followingQuery = db.query.followingTable.findMany({
			where: gt(followingTable.updated_at, since),
			orderBy: [desc(followingTable.approved), asc(followingTable.name)],
			columns: {
				url: true,
				name: true,
				image: true,
				shared_key: true,
				approved: true,
				deleted_at: true,
			},
		});

		const [currentUser, followingData] = await Promise.all([userQuery, followingQuery]);

		if (!currentUser) {
			return unauthorized();
		}

		const profile =
			currentUser.updated_at > since
				? ({
						url: currentUser.url,
						email: currentUser.email,
						name: currentUser.name,
						bio: currentUser.bio,
						location: currentUser.location,
						image: currentUser.image,
					} satisfies ProfileModel)
				: undefined;

		const following =
			followingData.length > 0
				? await Promise.all(
						followingData.map(
							async (f) =>
								({
									approved: f.approved,
									url: f.url,
									name: f.name,
									image: f.image,
									token: await createHeaderToken({
										url: currentUser.url,
										shared_key: f.shared_key,
									}),
									deleted: !!f.deleted_at,
								}) satisfies FollowingModel,
						),
					)
				: undefined;

		return ok({
			profile,
			following,
			notificationCount: currentUser.notification_count,
			messageCount: currentUser.message_count,
		} satisfies ExtensionRefreshModel);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
