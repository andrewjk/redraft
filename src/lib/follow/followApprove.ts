import db from "@/data/db";
import { followedByTable } from "@/data/schema";
import { ok, serverError, unauthorized, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
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
		console.log("APPRAVING", model);
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
		let sendUrl = `${record.url}${record.url.endsWith("/") ? "" : "/"}api/follow/confirm`;
		let sendData: FollowConfirmModel = {
			sharedKey: record.shared_key,
		};
		console.log("FETCHING", sendUrl, sendData);
		const response = await fetch(sendUrl, { method: "POST", body: JSON.stringify(sendData) });
		if (response.status !== 200) {
			return unprocessable();
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
