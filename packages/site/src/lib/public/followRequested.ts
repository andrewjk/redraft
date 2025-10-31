import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import transaction from "../../data/transaction";
import { FOLLOW_CHECK_VERSION } from "../../types/public/FollowCheckModel";
import type FollowCheckModel from "../../types/public/FollowCheckModel";
import type FollowCheckResponseModel from "../../types/public/FollowCheckResponseModel";
import { FOLLOW_REQUESTED_VERSION } from "../../types/public/FollowRequestedModel";
import type FollowRequestedModel from "../../types/public/FollowRequestedModel";
import type FollowRequestedResponseModel from "../../types/public/FollowRequestedResponseModel";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FollowRequestedModel = await request.json();
		if (model.version !== FOLLOW_REQUESTED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FOLLOW_REQUESTED_VERSION})`,
			);
		}

		// Check that this request actually came from the url claimed by hitting /follow/check
		let sendUrl = `${model.url}api/public/follow/check`;
		let sendData: FollowCheckModel = {
			//url: model.url,
			sharedKey: model.sharedKey,
			version: FOLLOW_CHECK_VERSION,
		};
		const response = await postPublic(sendUrl, sendData);
		if (!response.ok) {
			return response;
		}
		const confirmData = (await response.json()) as FollowCheckResponseModel;

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Create the followed by record, with approved = false
				const record = {
					approved: false,
					url: model.url,
					shared_key: model.sharedKey,
					name: confirmData.name,
					image: confirmData.image,
					bio: confirmData.bio,
					created_at: new Date(),
					updated_at: new Date(),
				};
				await tx.insert(followedByTable).values(record);

				// Create a notification
				await createNotification(tx, model.url, `${confirmData.name} has requested to follow you`);
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		updateNotificationCounts(db);

		const data: FollowRequestedResponseModel = {
			name: user.name,
			image: user.image,
		};
		return ok(data);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
