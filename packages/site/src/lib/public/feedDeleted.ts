import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
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
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		await transaction(db, async (tx) => {
			try {
				// Delete the feed record
				await tx.delete(feedTable).where(eq(feedTable.slug, model.slug));
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
