import { badRequest, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import profileSend from "../..//api/profile/send/+server";
import database from "../../data/database";
import { userLinksTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type ProfileEditModel from "../../types/profile/ProfileEditModel";
import ProfileEditSchema from "../../types/profile/ProfileEditSchema";
import * as api from "../api";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function profileEdit(
	request: Request,
	params: Record<string, string>,
	token: string,
	code: string,
) {
	let errorMessage = "";

	try {
		const db = database();

		let model: ProfileEditModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(ProfileEditSchema, model);
		if (!validated.success) {
			const message = validated.issues.map((e) => e.message).join("\n");
			console.trace("ERROR", message);
			return badRequest({
				message,
				data: model,
			});
		}
		model = validated.output;

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

		await transaction(db, async (tx) => {
			try {
				// Update the user in the database
				const user = {
					id: currentUser.id,
					email: model.email,
					name: model.name,
					bio: model.bio,
					about: model.about,
					location: model.location,
					image: model.image,
					updated_at: new Date(),
				};
				await tx.update(usersTable).set(user).where(eq(usersTable.id, currentUser.id));

				// Update the user's links in the database
				// TODO: Is there a better way to do this?
				let updates = [];
				for (let link of currentUser.links) {
					if (!model.links.find((l) => l.id === link.id)) {
						updates.push(tx.delete(userLinksTable).where(eq(userLinksTable.id, link.id)));
					}
				}
				for (let link of model.links) {
					if (link.id < 0) {
						updates.push(
							tx.insert(userLinksTable).values({
								user_id: currentUser.id,
								text: link.text,
								url: link.url,
								created_at: new Date(),
								updated_at: new Date(),
							}),
						);
					} else {
						updates.push(
							tx
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
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		// Send an update to all followers/followed by
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		// It has to be done outside of the transaction
		api.post(`profile/send`, profileSend, params, null, token);

		return ok({
			url: currentUser.url,
			name: model.name,
			image: model.image,
			token,
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
