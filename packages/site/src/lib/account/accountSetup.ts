import { created, forbidden, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import { userTokensTable } from "../../data/schema/userTokensTable";
import env from "../env";
import createUserToken from "../utils/createUserToken";
import ensureSlash from "../utils/ensureSlash";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash, hashPassword } from "../utils/hashPasswords";
import uuid from "../utils/uuid";

export type SetupModel = {
	username: string;
	password: string;
	name: string;
	email: string;
	bio?: string;
	location?: string;
	image?: string;
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

		const model: SetupModel = await request.json();

		// Make sure a different user doesn't already exist
		const currentUser = await db.query.usersTable.findFirst();
		if (currentUser) {
			if (!compareWithHash(model.password.trim(), currentUser.password)) {
				return forbidden();
			}
		}

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
			url: ensureSlash(env().SITE_LOCATION),
			password,
			name: model.name.trim(),
			bio: model.bio ?? "",
			location: model.location ?? "",
			image: model.image ?? "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert the user into the database
		const newUser = currentUser
			? (
					await db
						.update(usersTable)
						.set(user)
						.where(eq(usersTable.id, currentUser.id))
						.returning({ id: usersTable.id })
				)[0]
			: (await db.insert(usersTable).values(user).returning({ id: usersTable.id }))[0];

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
