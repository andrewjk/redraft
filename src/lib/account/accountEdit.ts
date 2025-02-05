import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";
import getUser from "../utils/getUser";
import accountView from "./accountView";

export type EditModel = {
	email: string;
	username: string;
	password: string;
	name: string;
	bio: string;
	image: string;
};

export default async function accountEdit(request: Request, username: string) {
	try {
		const model: EditModel = await request.json();

		// Get the current user
		const currentUser = await getUser(username);
		if (!currentUser) {
			return unauthorized();
		}

		// Create the user
		const user = {
			id: currentUser.id,
			email: model.email,
			username: model.username,
			name: model.name,
			bio: model.bio,
			image: model.image,
			//created_at: new Date(),
			updated_at: new Date(),
		};

		// Update the user in the database
		const newUser = (
			await db.update(usersTable).set(user).where(eq(usersTable.id, currentUser.id)).returning()
		)[0];

		// Create the user view
		const view = accountView(newUser);

		return ok(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
