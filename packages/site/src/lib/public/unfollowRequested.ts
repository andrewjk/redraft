import { notFound, ok, serverError } from "@torpor/build/response";
import { and, eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

export type UnfollowRequestedModel = {
	url: string;
	sharedKey: string;
};

/**
 * Receives a follow request from another user.
 */
export default async function followRequested(request: Request) {
	try {
		const db = database();

		const model: UnfollowRequestedModel = await request.json();

		// Get the current (only) user
		const user = await db.query.usersTable.findFirst();
		if (!user) {
			return notFound();
		}

		// Get the followed by record
		const record = await db.query.followedByTable.findFirst({
			where: and(
				eq(followedByTable.url, model.url),
				eq(followedByTable.shared_key, model.sharedKey),
			),
		});

		// NOTE: Return ok even if the record was not found, to avoid leaking info

		if (record) {
			await db
				.update(followedByTable)
				.set({
					deleted_at: new Date(),
				})
				.where(eq(followedByTable.id, record.id));
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
