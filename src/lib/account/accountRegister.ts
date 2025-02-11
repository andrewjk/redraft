import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { serverError } from "@torpor/build/response";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { hashPassword } from "../utils/hashPasswords";

export type RegisterModel = {
	email: string;
	name: string;
	password: string;
};

export default async function accountRegister(request: Request) {
	try {
		const model: RegisterModel = await request.json();

		// Create the user
		const hashed = hashPassword(model.password);
		const user = {
			email: model.email,
			// TODO: What should this be?
			username: "",
			// TODO: Get this from the request headers?
			url: process.env.SITE_LOCATION!,
			password: hashed,
			name: model.name,
			// TODO: Require this stuff to be set?
			bio: "",
			image: "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the user into the database
		await db.insert(usersTable).values(user).returning();

		// Create the authentication token for future use
		const token = await createUserToken(user);

		return {
			email: user.email,
			name: user.name,
			image: user.image,
			token,
		};
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
