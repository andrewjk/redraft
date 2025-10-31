import { ok, serverError, unauthorized } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followingTable, usersTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import transaction from "../../data/transaction";
import type RequestModel from "../../types/follow/RequestModel";
import type FollowRequestedModel from "../../types/public/FollowRequestedModel";
import { FOLLOW_REQUESTED_VERSION } from "../../types/public/FollowRequestedModel";
import type FollowRequestedResponseModel from "../../types/public/FollowRequestedResponseModel";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import uuid from "../utils/uuid";

/**
 * Sends a follow request to another user.
 */
export default async function followRequest(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model: RequestModel = await request.json();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Find the following record
		const followQuery = db.query.followingTable.findFirst({
			where: and(eq(followingTable.url, model.url), isNull(followingTable.deleted_at)),
			columns: { id: true },
		});

		const [currentUser, follow] = await Promise.all([currentUserQuery, followQuery]);
		if (!currentUser) {
			return unauthorized();
		}

		// If this user has already been requested, just return ok
		if (!follow) {
			// Create the shared key that we will use to authenticate ourselves when
			// commenting etc, and which the other user will use to authenticate
			// themselves when sending us posts etc
			const sharedKey = uuid();

			// Send off a request to the url, and hopefully receive the name and image
			let sendUrl = `${model.url}api/public/follow/request`;
			let sendData: FollowRequestedModel = {
				url: currentUser.url,
				sharedKey,
				version: FOLLOW_REQUESTED_VERSION,
			};
			let response = await postPublic(sendUrl, sendData);
			if (!response.ok) {
				return response;
			}
			let requestData = (await response.json()) as FollowRequestedResponseModel;

			await transaction(db, async (tx) => {
				try {
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
						await tx.insert(followingTable).values(record).returning({ id: followingTable.id })
					)[0].id;

					// Update the following record with the name and image
					let record2 = {
						name: requestData.name,
						image: requestData.image,
						updated_at: new Date(),
					};
					await tx.update(followingTable).set(record2).where(eq(followingTable.id, recordId));

					// Create an activity record
					await tx.insert(activityTable).values({
						url: model.url,
						text: `You requested to follow ${record.name}`,
						created_at: new Date(),
						updated_at: new Date(),
					});
				} catch (error) {
					errorMessage = getErrorMessage(error).message;
					throw error;
				}
			});
		}

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
