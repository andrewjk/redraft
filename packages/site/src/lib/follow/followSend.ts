import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import { FollowRequestModel, FollowRequestResponseModel } from "../public/followRequested";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";

export type FollowModel = {
	url: string;
};

/**
 * Sends a follow request to another user.
 */
export default async function followSend(request: Request, code: string) {
	try {
		const db = database();

		const model: FollowModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Find the following record
		const follow = await db.query.followingTable.findFirst({
			where: and(eq(followingTable.url, model.url), isNull(followingTable.deleted_at)),
			columns: { id: true },
		});

		// If this user has already been requested, just return ok
		if (!follow) {
			// Create the shared key that we will use to authenticate ourselves when
			// commenting etc, and which the other user will use to authenticate
			// themselves when sending us posts etc
			const sharedKey = uuid();

			// Create the following record, with approved = false
			let record = {
				approved: false,
				url: model.url,
				shared_key: sharedKey,
				name: "",
				image: "",
				bio: "",
				created_at: new Date(),
				updated_at: new Date(),
			};
			const recordId = (
				await db.insert(followingTable).values(record).returning({ id: followingTable.id })
			)[0].id;

			// Send off a request to the url, and hopefully receive the name and image
			let sendUrl = `${model.url}api/public/follow/request`;
			let sendData: FollowRequestModel = {
				url: currentUser.url,
				sharedKey,
			};
			let requestData = (await postPublic(sendUrl, sendData)) as FollowRequestResponseModel;

			// Update the following record with the name and image
			let record2 = {
				name: requestData.name,
				image: requestData.image,
				updated_at: new Date(),
			};
			await db.update(followingTable).set(record2).where(eq(followingTable.id, recordId));
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
