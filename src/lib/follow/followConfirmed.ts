import db from "@/data/db";
import { followingTable } from "@/data/schema";
import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type FollowConfirmModel = {
	sharedKey: string;
};

/**
 * Confirms a follow request that was sent.
 */
export default async function followConfirmed(request: Request) {
	try {
		const model: FollowConfirmModel = await request.json();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Set approved in the following record
		await db
			.update(followingTable)
			.set({
				approved: true,
				updated_at: new Date(),
			})
			.where(eq(followingTable.shared_key, model.sharedKey))
			.returning();

		// TODO: Create a notification

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
