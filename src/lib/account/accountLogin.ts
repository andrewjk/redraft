import database from "@/data/database";
import { usersTable } from "@/data/schema";
import { userTokensTable } from "@/data/schema/userTokensTable";
import { forbidden, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash } from "../utils/hashPasswords";
import uuid from "../utils/uuid";

export type LoginModel = {
	email: string;
	password: string;
	rememberMe: boolean;
};

export default async function accountLogin(request: Request) {
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

		// Create a user token
		const code = uuid().toString();
		const sevenDays = 7 * 24 * 60 * 60;
		const tenYears = 10 * 365 * 24 * 60 * 60;
		const maxAge = model.rememberMe ? tenYears : sevenDays;
		await db.insert(userTokensTable).values({
			user_id: user.id,
			code,
			expires_at: new Date(new Date().getTime() + maxAge * 1000),
		});

		// Create the authentication token for future use
		const token = await createUserToken(user, code);

		return ok({
			url: user.url,
			username: user.username,
			name: user.name,
			image: user.image,
			token,
			code,
		});
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
