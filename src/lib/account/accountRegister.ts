import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { created, serverError } from "@torpor/build/response";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { hashPassword } from "../utils/hashPasswords";
import accountPreview from "./accountPreview";

export type RegisterModel = {
	email: string;
	username: string;
	password: string;
};

export default async function accountRegister(request: Request) {
	try {
		const model: RegisterModel = await request.json();

		// Create the user
		const hashed = hashPassword(model.password);
		const user = {
			email: model.email,
			username: model.username,
			// TODO: Get this from the request headers?
			url: process.env.SITE_LOCATION!,
			password: hashed,
			name: "",
			bio: "",
			image: "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the user into the database
		const newUser = (await db.insert(usersTable).values(user).returning())[0];

		// Create the authentication token for future use
		const token = await createUserToken(user);

		// Create the user view with the authentication token
		const view = accountPreview(newUser, token);

		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
