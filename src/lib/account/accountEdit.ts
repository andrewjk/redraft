import db from "@/data/db";
import { usersTable } from "@/data/schema";
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

export default async function accountEdit(request: Request) {
	try {
		const model: EditModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		// Create the user
		const user = {
			id: currentUser.id,
			email: model.email,
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
