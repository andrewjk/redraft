import { ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database, { Database, type DatabaseTransaction } from "../../data/database";
import { followedByTable, followingTable } from "../../data/schema";
import { FollowedBy } from "../../data/schema/followedByTable";
import { Following } from "../../data/schema/followingTable";
import transaction from "../../data/transaction";
import { PROFILE_UPDATED_VERSION } from "../../types/public/ProfileUpdatedModel";
import type ProfileUpdatedModel from "../../types/public/ProfileUpdatedModel";
import createNotification from "../notifications/createNotification";
import updateNotificationCounts from "../notifications/updateNotificationCounts";
import getErrorMessage from "../utils/getErrorMessage";

export default async function profileUpdated(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		const model: ProfileUpdatedModel = await request.json();
		if (model.version !== PROFILE_UPDATED_VERSION) {
			return unprocessable(
				`Incompatible version (received ${model.version}, expected ${PROFILE_UPDATED_VERSION})`,
			);
		}

		// Get the following and followed by users
		const followingQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, model.sharedKey),
		});
		const [following, followedBy] = await Promise.all([followingQuery, followedByQuery]);

		await transaction(db, async (tx) => {
			try {
				await Promise.all([
					updateFollowingTable(model, tx, following),
					updateFollowedByTable(model, tx, followedBy),
				]);
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

async function updateFollowingTable(
	model: ProfileUpdatedModel,
	tx: Database | DatabaseTransaction,
	user?: Following,
) {
	if (user) {
		await tx
			.update(followingTable)
			.set({
				name: model.name,
				image: model.image,
				bio: model.bio,
			})
			.where(eq(followingTable.id, user.id));

		// Create a notification for the users you are following only
		await createNotification(tx, user.url, `${user.name} has changed their profile`);
	}
}

async function updateFollowedByTable(
	model: ProfileUpdatedModel,
	tx: Database | DatabaseTransaction,
	user?: FollowedBy,
) {
	if (user) {
		await tx
			.update(followedByTable)
			.set({
				name: model.name,
				image: model.image,
				bio: model.bio,
			})
			.where(eq(followedByTable.id, user.id));
	}
}
