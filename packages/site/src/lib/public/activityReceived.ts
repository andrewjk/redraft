import { notFound, ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, followingTable } from "../../data/schema";
import transaction from "../../data/transaction";
import { ACTIVITY_RECEIVED_VERSION } from "../../types/public/ActivityReceivedModel";
import type ActivityReceivedModel from "../../types/public/ActivityReceivedModel";
import getErrorMessage from "../utils/getErrorMessage";

export default async function activityReceived(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: ActivityReceivedModel = await request.json();
		if (model.version !== ACTIVITY_RECEIVED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${ACTIVITY_RECEIVED_VERSION})`,
			);
		}

		const user = await db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		let message = "Unknown activity";
		switch (model.type) {
			case "commented": {
				message = "You commented on a post";
				break;
			}
			case "liked": {
				message = "You liked a post";
				break;
			}
			case "unliked": {
				message = "You unliked a post";
				break;
			}
			case "reacted": {
				message = "You reacted to a post";
				break;
			}
		}

		await transaction(db, async (tx) => {
			try {
				// Create an activity record
				await tx.insert(activityTable).values({
					// Concat the urls for a bit of extra security (so someone can't
					// send us a full URL pointing to anywhere, only the pathname)
					url: `${user.url}${model.url}`,
					text: message,
					created_at: new Date(),
					updated_at: new Date(),
				});
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
