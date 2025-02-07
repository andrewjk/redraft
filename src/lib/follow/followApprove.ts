import db from "@/data/db";
import { followedByTable } from "@/data/schema";
import { ok, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import { postPublic } from "../public";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";
import { FollowConfirmModel } from "./followConfirmed";

export type ApproveModel = {
	id: number;
};

/**
 * Approves a follow request from another user.
 */
export default async function followApprove(request: Request, username: string) {
	try {
		const model: ApproveModel = await request.json();

		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		// Set approved in the followed by record
		const record = (
			await db
				.update(followedByTable)
				.set({
					approved: true,
					updated_at: new Date(),
				})
				.where(eq(followedByTable.id, model.id))
				.returning()
		)[0];

		// TODO: Create a notification

		// Send the confirmation
		let sendUrl = `${record.url}api/public/follow/confirm`;
		let sendData: FollowConfirmModel = {
			sharedKey: record.shared_key,
		};
		await postPublic(sendUrl, sendData);

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
