import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { userLinksTable, usersTable } from "../../data/schema";
import profileSend from "../../routes/api/profile/send/+server";
import * as api from "../api";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type ProfileEdit = {
	email: string;
	password: string;
	name: string;
	bio: string;
	location: string;
	image: string;
	links: {
		id: number;
		url: string;
		text: string;
	}[];
};

export default async function profileEdit(
	request: Request,
	params: Record<string, string>,
	token: string,
	code: string,
) {
	try {
		const db = database();

		const model: ProfileEdit = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
			with: {
				links: true,
			},
		});
		if (!currentUser) {
			return unauthorized();
		}

		// Update the user in the database
		const user = {
			id: currentUser.id,
			email: model.email,
			name: model.name,
			bio: model.bio,
			location: model.location,
			image: model.image,
			updated_at: new Date(),
		};
		await db.update(usersTable).set(user).where(eq(usersTable.id, currentUser.id));

		// Update the user's links in the database
		// TODO: Is there a better way to do this?
		let updates = [];
		for (let link of currentUser.links) {
			if (!model.links.find((l) => l.id === link.id)) {
				updates.push(db.delete(userLinksTable).where(eq(userLinksTable.id, link.id)));
			}
		}
		for (let link of model.links) {
			if (link.id < 0) {
				updates.push(
					db.insert(userLinksTable).values({
						user_id: currentUser.id,
						text: link.text,
						url: link.url,
						created_at: new Date(),
						updated_at: new Date(),
					}),
				);
			} else {
				updates.push(
					db
						.update(userLinksTable)
						.set({
							url: link.url,
							text: link.text,
						})
						.where(eq(userLinksTable.id, link.id)),
				);
			}
		}
		await Promise.all(updates);

		// Send an update to all followers/followed by
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`profile/send`, profileSend, params, null, token);

		return ok({
			url: currentUser.url,
			name: model.name,
			image: model.image,
			token,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
