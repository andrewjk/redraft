import database from "@/data/database";
import { followedByTable, followingTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import { ProfileUpdatedModel } from "../public/profileUpdated";
import getErrorMessage from "../utils/getErrorMessage";

// TODO: Should only send the data that has changed

export default async function profileSend() {
	const db = database();

	try {
		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
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
				};
				await postPublic(sendUrl, sendData);
			} catch {
				// TODO: as above
			}
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
