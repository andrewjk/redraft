import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, followingTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type FollowConfirmedModel from "../../types/public/FollowConfirmedModel";
import { FOLLOW_CONFIRMED_VERSION } from "../../types/public/FollowConfirmedModel";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import getErrorMessage from "../utils/getErrorMessage";

/**
 * Confirms a follow request that was sent.
 */
export default async function followConfirmed(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FollowConfirmedModel = await request.json();
		if (model.version !== FOLLOW_CONFIRMED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FOLLOW_CONFIRMED_VERSION})`,
			);
		}

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Set approved in the following record
				const record = (
					await tx
						.update(followingTable)
						.set({
							approved: true,
							updated_at: new Date(),
						})
						.where(eq(followingTable.shared_key, model.sharedKey))
						.returning({ url: followingTable.url, name: followingTable.name })
				)[0];

				// Create a notification
				await createNotification(tx, record.url, `${record.name} has approved your follow request`);

				// Create an activity record
				await tx.insert(activityTable).values({
					url: record.url,
					text: `${record.name} has approved your follow request`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		updateNotificationCounts(db);

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
