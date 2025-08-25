import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, followingTable } from "../../data/schema";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const FOLLOW_CONFIRMED_VERSION = 1;

export type FollowConfirmedModel = {
	sharedKey: string;
	version: number;
};

/**
 * Confirms a follow request that was sent.
 */
export default async function followConfirmed(request: Request) {
	let errorMessage: string | undefined;

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

		await db.transaction(async (tx) => {
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
				updateNotificationCounts(tx);

				// Create an activity record
				await tx.insert(activityTable).values({
					url: record.url,
					text: `${record.name} has approved your follow request`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
