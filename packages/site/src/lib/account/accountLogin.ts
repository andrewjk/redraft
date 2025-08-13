import { forbidden, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, userTokensTable, usersTable } from "../../data/schema";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash } from "../utils/hashPasswords";
import uuid from "../utils/uuid";

export type LoginModel = {
	email: string;
	password: string;
	rememberMe: boolean;
};

export type LoginResponseModel = {
	url: string;
	username: string;
	name: string;
	image: string;
	token: string;
	code: string;
};

export default async function accountLogin(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		const model: LoginModel = await request.json();

		// Get the user with the given email
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, model.email),
		});

		// Compare the given password with the one stored
		if (!user || !compareWithHash(model.password.trim(), user.password)) {
			return forbidden();
		}

		const code = uuid().toString();
		const sevenDays = 7 * 24 * 60 * 60;
		const tenYears = 10 * 365 * 24 * 60 * 60;
		const maxAge = model.rememberMe ? tenYears : sevenDays;

		await db.transaction(async (tx) => {
			try {
				// Create a user token
				await tx.insert(userTokensTable).values({
					user_id: user.id,
					code,
					expires_at: new Date(new Date().getTime() + maxAge * 1000),
				});

				// Create an activity record
				await tx.insert(activityTable).values({
					url: user.url,
					text: "You logged in",
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});

		// Create the authentication token for future use
		const token = await createUserToken(user, code);

		const response: LoginResponseModel = {
			url: user.url,
			username: user.username,
			name: user.name,
			image: user.image,
			token,
			code,
		};

		return ok(response);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
