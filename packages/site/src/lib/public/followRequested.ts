import { notFound, ok, serverError } from "@torpor/build/response";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import { type FollowCheckModel, type FollowCheckResponseModel } from "./followCheck";

export type FollowRequestedModel = {
	url: string;
	sharedKey: string;
};

export type FollowRequestedResponseModel = {
	name: string;
	image: string;
};

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	try {
		const db = database();

		const model: FollowRequestedModel = await request.json();

		// Check that this request actually came from the url claimed by hitting /follow/check
		let sendUrl = `${model.url}api/public/follow/check`;
		let sendData: FollowCheckModel = {
			//url: model.url,
			sharedKey: model.sharedKey,
		};
		const confirmData = (await postPublic(sendUrl, sendData)) as FollowCheckResponseModel;

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
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
		await db.insert(followedByTable).values(record);

		// Create a notification
		await db.insert(notificationsTable).values({
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
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
