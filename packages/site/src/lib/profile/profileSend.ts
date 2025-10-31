import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, followingTable, usersTable } from "../../data/schema";
import type ProfileUpdatedModel from "../../types/public/ProfileUpdatedModel";
import { PROFILE_UPDATED_VERSION } from "../../types/public/ProfileUpdatedModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

// TODO: Should only send the data that has changed

export default async function profileSend(code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Load the followers and followed by
		const users = await Promise.all([
			db.query.followedByTable.findMany({
				where: eq(followedByTable.approved, true),
			}),
			db.query.followingTable.findMany({
				where: eq(followingTable.approved, true),
			}),
		]);
		const allusers = users.flatMap((u) => u);

		// TODO: Insert a queue record for each follower/followed by and set it
		// to sent when success. Then delete all handled records at the end.
		// Allow doing something with failed records

		for (let user of allusers) {
			try {
				let sendUrl = `${user.url}api/public/profile`;
				let sendData: ProfileUpdatedModel = {
					sharedKey: user.shared_key,
					name: currentUser.name,
					image: currentUser.image,
					bio: currentUser.bio,
					version: PROFILE_UPDATED_VERSION,
				};
				await postPublic(sendUrl, sendData);
			} catch {
				// TODO: as above
			}
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
