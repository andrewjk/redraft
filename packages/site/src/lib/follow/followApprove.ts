import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import { postPublic } from "../public";
import { FOLLOW_CONFIRMED_VERSION, type FollowConfirmedModel } from "../public/followConfirmed";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type ApproveModel = {
	id: number;
};

/**
 * Approves a follow request from another user.
 */
export default async function followApprove(request: Request, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: ApproveModel = await request.json();

				// Get the current user
				const currentUser = await tx.query.usersTable.findFirst({
					where: eq(usersTable.id, userIdQuery(code)),
				});
				if (!currentUser) {
					return unauthorized();
				}

				// Set approved in the followed by record
				const record = (
					await tx
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
				let sendData: FollowConfirmedModel = {
					sharedKey: record.shared_key,
					version: FOLLOW_CONFIRMED_VERSION,
				};
				await postPublic(sendUrl, sendData);

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
