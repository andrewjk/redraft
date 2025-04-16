import database from "@/data/database";
import { followedByTable, followingTable } from "@/data/schema";
import { ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
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

		// TODO: Create a notification

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
