import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followingTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

export type FollowConfirmModel = {
	sharedKey: string;
};

/**
 * Confirms a follow request that was sent.
 */
export default async function followConfirmed(request: Request) {
	try {
		const db = database();

		const model: FollowConfirmModel = await request.json();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Set approved in the following record
		const record = (
			await db
				.update(followingTable)
				.set({
					approved: true,
					updated_at: new Date(),
				})
				.where(eq(followingTable.shared_key, model.sharedKey))
				.returning({ url: followingTable.url, name: followingTable.name })
		)[0];

		// Create a notification
		await db.insert(notificationsTable).values({
			url: record.url,
			text: `${record.name} has approved your follow request`,
			created_at: new Date(),
			updated_at: new Date(),
		});

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
