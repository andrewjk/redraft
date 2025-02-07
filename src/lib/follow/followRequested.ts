import db from "@/data/db";
import { followedByTable } from "@/data/schema";
import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import { FollowCheckModel, FollowCheckResponseModel } from "./followCheck";

export type FollowRequestModel = {
	url: string;
	sharedKey: string;
};

export type FollowRequestResponseModel = {
	name: string;
	image: string;
};

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	try {
		const model: FollowRequestModel = await request.json();

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
			username: "",
			url: model.url,
			shared_key: model.sharedKey,
			name: confirmData.name,
			image: confirmData.image,
			created_at: new Date(),
			updated_at: new Date(),
		};
		await db.insert(followedByTable).values(record);

		// TODO: Create a notification

		const data: FollowRequestResponseModel = {
			name: user.name,
			image: user.image,
		};

		return ok(data);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
