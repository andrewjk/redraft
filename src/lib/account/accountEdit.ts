import db from "@/data/db";
import { usersTable } from "@/data/schema";
import * as api from "@/lib/api";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import accountView from "./accountView";

export type EditModel = {
	email: string;
	password: string;
	name: string;
	bio: string;
	image: string;
};

export default async function accountEdit(request: Request, token: string) {
	try {
		const model: EditModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Update the user in the database
		const user = {
			id: currentUser.id,
			email: model.email,
			name: model.name,
			bio: model.bio,
			image: model.image,
			updated_at: new Date(),
		};
		await db.update(usersTable).set(user).where(eq(usersTable.id, currentUser.id));

		// Send an update to all followers/followed by
		// This could take some time, so send it off to be done in an endpoint without awaiting it
		api.post(`account/send`, null, token);

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
