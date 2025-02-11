import db from "@/data/db";
import { followingTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { postPublic } from "../public";
import { FollowRequestModel, FollowRequestResponseModel } from "../public/followRequested";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";

export type FollowModel = {
	url: string;
};

/**
 * Sends a follow request from another user.
 */
export default async function followSend(request: Request, url: URL, username: string) {
	try {
		const model: FollowModel = await request.json();

		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		// Create the shared key that we will use to authenticate ourselves when
		// commenting etc, and which the other user will use to authenticate
		// themselves when sending us posts etc
		const sharedKey = uuid();

		// TODO: Upsert, in case we've sent a following request to this user before
		// Create the following record, with approved = false
		let record = {
			approved: false,
			username: "",
			url: model.url,
			shared_key: sharedKey,
			name: "",
			image: "",
			created_at: new Date(),
			updated_at: new Date(),
		};
		let recordId = (
			await db.insert(followingTable).values(record).returning({ id: followingTable.id })
		)[0].id;

		// Send off a request to the url, and hopefully receive the name and image
		let sendUrl = `${model.url}api/public/follow/request`;
		let sendData: FollowRequestModel = {
			url: url.toString().replace("/follow", ""),
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

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
