import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import { activityTable } from "../../data/schema/activityTable";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

export type FollowConfirmedModel = {
	sharedKey: string;
};

/**
 * Confirms a follow request that was sent.
 */
export default async function followConfirmed(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: FollowConfirmedModel = await request.json();

				// Get the current (only) user
				const user = await tx.query.usersTable.findFirst();
				if (!user) {
					return notFound();
				}

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
				await tx.insert(notificationsTable).values({
					url: record.url,
					text: `${record.name} has approved your follow request`,
					created_at: new Date(),
					updated_at: new Date(),
				});

				// Create an activity record
				await tx.insert(activityTable).values({
					url: record.url,
					text: `${record.name} has approved your follow request`,
					created_at: new Date(),
					updated_at: new Date(),
				});

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
