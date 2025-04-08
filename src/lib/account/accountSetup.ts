import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { created, forbidden, serverError } from "@torpor/build/response";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { hashPassword } from "../utils/hashPasswords";

export type SetupModel = {
	username: string;
	password: string;
	name: string;
	email: string;
	bio?: string;
	image?: string;
	location?: string;
};

export default async function accountSetup(request: Request) {
	try {
		// TODO: Make sure a user doesn't exist

		const model: SetupModel = await request.json();

		// Make sure the name and password match the env variables
		if (model.username !== process.env.USERNAME || model.password !== process.env.PASSWORD) {
			return forbidden();
		}

		// Create the user
		const hashed = hashPassword(model.password);
		const user = {
			email: model.email,
			username: model.username,
			// TODO: Get this from the request headers?
			url: process.env.SITE_LOCATION!,
			password: hashed,
			name: model.name,
			bio: model.bio ?? "",
			image: model.image ?? "",
			location: model.location ?? "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the user into the database
		await db.insert(usersTable).values(user).returning();

		// Create the authentication token for future use
		const token = await createUserToken(user);

		return created({
			url: user.url,
			name: user.name,
			image: user.image,
			token,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
