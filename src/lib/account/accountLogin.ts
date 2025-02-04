import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { created, forbidden, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash } from "../utils/hashPasswords";
import accountView from "./accountView";

export type LoginModel = {
	email: string;
	password: string;
};

export default async function accountLogin(request: Request) {
	try {
		const model: LoginModel = await request.json();

		// Get the user with the given email
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, model.email),
		});

		// Compare the user password given with the one stored
		if (!user || !compareWithHash(model.password, user.password)) {
			return forbidden();
		}

		// Create the authentication token for future use
		const token = await createUserToken(user);

		// Create the user view with the authentication token
		const view = accountView(user, token);

		return created(view);
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
