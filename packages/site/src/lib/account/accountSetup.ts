import { created, forbidden, serverError } from "@torpor/build/response";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import { userTokensTable } from "../../data/schema/userTokensTable";
import env from "../env";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { hashPassword } from "../utils/hashPasswords";
import uuid from "../utils/uuid";

export type SetupModel = {
	username: string;
	password: string;
	name: string;
	email: string;
	bio?: string;
	image?: string;
	location?: string;
};

export type SetupResponseModel = {
	url: string;
	username: string;
	name: string;
	image: string;
	token: string;
	code: string;
};

export default async function accountSetup(request: Request) {
	try {
		const db = database();

		// TODO: Make sure a user doesn't exist

		const model: SetupModel = await request.json();

		// Make sure the name and password match the env variables
		if (model.username !== env().USERNAME || model.password !== env().PASSWORD) {
			return forbidden();
		}

		// Create the user
		const password = hashPassword(model.password.trim());
		const user = {
			email: model.email.trim(),
			username: model.username.trim(),
			// TODO: Get this from the request headers?
			url: env().SITE_LOCATION!,
			password,
			name: model.name.trim(),
			bio: model.bio ?? "",
			image: model.image ?? "",
			location: model.location ?? "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the user into the database
		const newUser = (await db.insert(usersTable).values(user).returning({ id: usersTable.id }))[0];

		// Create a user token
		// TODO: Send them to the login page instead
		const code = uuid().toString();
		const sevenDays = 7 * 24 * 60 * 60;
		await db.insert(userTokensTable).values({
			user_id: newUser.id,
			code: code,
			expires_at: new Date(new Date().getTime() + sevenDays * 1000),
		});

		// Create the authentication token for future use
		const token = await createUserToken(user, code);

		const response: SetupResponseModel = {
			url: user.url,
			username: user.username,
			name: user.name,
			image: user.image,
			token,
			code,
		};

		return created(response);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
