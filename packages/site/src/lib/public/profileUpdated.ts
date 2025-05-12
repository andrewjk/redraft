import { ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, followingTable } from "../../data/schema";
import { notificationsTable } from "../../data/schema/notificationsTable";
import getErrorMessage from "../utils/getErrorMessage";

export type ProfileUpdatedModel = {
	sharedKey: string;
	name: string;
	image: string;
	bio: string;
};

export default async function profileUpdated(request: Request) {
	try {
		const model: ProfileUpdatedModel = await request.json();

		await Promise.all([updateFollowingTable(model), updateFollowedByTable(model)]);

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}

async function updateFollowingTable(model: ProfileUpdatedModel) {
	const db = database();

	const user = await db.query.followingTable.findFirst({
		where: eq(followingTable.shared_key, model.sharedKey),
	});
	if (user) {
		await db
			.update(followingTable)
			.set({
				name: model.name,
				image: model.image,
				bio: model.bio,
			})
			.where(eq(followingTable.id, user.id));

		// Create a notification for the users you are following only
		await db.insert(notificationsTable).values({
			url: user.url,
			text: `${user.name} has changed their profile`,
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
}

async function updateFollowedByTable(model: ProfileUpdatedModel) {
	const db = database();

	const user = await db.query.followedByTable.findFirst({
		where: eq(followedByTable.shared_key, model.sharedKey),
	});
	if (user) {
		await db
			.update(followedByTable)
			.set({
				name: model.name,
				image: model.image,
				bio: model.bio,
			})
			.where(eq(followedByTable.id, user.id));
	}
}
