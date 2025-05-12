import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import { FollowConfirmModel } from "../public/followConfirmed";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type ApproveModel = {
	id: number;
};

/**
 * Approves a follow request from another user.
 */
export default async function followApprove(request: Request, code: string) {
	try {
		const db = database();

		const model: ApproveModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
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
