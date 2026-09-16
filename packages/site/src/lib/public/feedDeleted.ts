import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type FeedDeletedModel from "../../types/public/FeedDeletedModel";
import { FEED_DELETED_VERSION } from "../../types/public/FeedDeletedModel";
import getErrorMessage from "../utils/getErrorMessage";

export default async function feedDeleted(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: FeedDeletedModel = await request.json();
		if (model.version !== FEED_DELETED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${FEED_DELETED_VERSION})`,
			);
		}

		const user = await db.query.followingTable.findFirst({
			where: and(eq(followingTable.shared_key, model.sharedKey), isNull(followingTable.deleted_at)),
		});
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Delete the feed record, scoped to this relationship so one
				// follower can't delete another follower's entries
				await tx
					.delete(feedTable)
					.where(and(eq(feedTable.slug, model.slug), eq(feedTable.user_id, user.id)));
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
