import { ok, serverError, unprocessable } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database, { type DatabaseTransaction } from "../../data/database";
import { followedByTable, followingTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

// IMPORTANT! Update this when the model changes
export const PROFILE_UPDATED_VERSION = 1;

export type ProfileUpdatedModel = {
	sharedKey: string;
	name: string;
	image: string;
	bio: string;
	version: number;
};

export default async function profileUpdated(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: ProfileUpdatedModel = await request.json();
				if (model.version !== PROFILE_UPDATED_VERSION) {
					return unprocessable(
						`Incompatible version (received ${model.version}, expected ${PROFILE_UPDATED_VERSION})`,
					);
				}

				await Promise.all([updateFollowingTable(tx, model), updateFollowedByTable(tx, model)]);

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

async function updateFollowingTable(tx: DatabaseTransaction, model: ProfileUpdatedModel) {
	const user = await tx.query.followingTable.findFirst({
		where: eq(followingTable.shared_key, model.sharedKey),
	});
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
		await tx.insert(notificationsTable).values({
			url: user.url,
			text: `${user.name} has changed their profile`,
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
}

async function updateFollowedByTable(tx: DatabaseTransaction, model: ProfileUpdatedModel) {
	const user = await tx.query.followedByTable.findFirst({
		where: eq(followedByTable.shared_key, model.sharedKey),
	});
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
