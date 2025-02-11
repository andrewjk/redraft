import db from "@/data/db";
import { usersTable } from "@/data/schema";
import { forbidden, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import createUserToken from "../utils/createUserToken";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash } from "../utils/hashPasswords";

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
