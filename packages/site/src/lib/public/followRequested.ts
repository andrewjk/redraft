import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import {
	FOLLOW_CHECK_VERSION,
	type FollowCheckModel,
	type FollowCheckResponseModel,
} from "./followCheck";

// IMPORTANT! Update this when the model changes
export const FOLLOW_REQUESTED_VERSION = 1;

export type FollowRequestedModel = {
	url: string;
	sharedKey: string;
	version: number;
};

export type FollowRequestedResponseModel = {
	name: string;
	image: string;
};

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
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
				const confirmData = (await postPublic(sendUrl, sendData)) as FollowCheckResponseModel;

				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst();
				if (!user) {
					return notFound();
				}

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
				await tx.insert(notificationsTable).values({
					url: model.url,
					text: `${confirmData.name} has requested to follow you`,
					created_at: new Date(),
					updated_at: new Date(),
				});

				const data: FollowRequestedResponseModel = {
					name: user.name,
					image: user.image,
				};

				return ok(data);
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
				return serverError(errorMessage);
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
