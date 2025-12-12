import { badRequest, created, forbidden, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { activityTable, userTokensTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type SetupModel from "../../types/account/SetupModel";
import type SetupResponseModel from "../../types/account/SetupResponseModel";
import SetupSchema from "../../types/account/SetupSchema";
import env from "../env";
import createUserToken from "../utils/createUserToken";
import ensureSlash from "../utils/ensureSlash";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash, hashPassword } from "../utils/hashPasswords";
import uuid from "../utils/uuid";

export default async function accountSetup(request: Request) {
	let errorMessage = "";

	try {
		const db = database();

		let model: SetupModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(SetupSchema, model);
		if (!validated.success) {
			model.password = "";
			const message = validated.issues.map((e) => e.message).join("\n");
			console.log("ERROR", message);
			return badRequest({
				message,
				data: model,
			});
		}
		model = validated.output;

		// Make sure a different user doesn't already exist
		const currentUser = await db.query.usersTable.findFirst();
		if (currentUser && !compareWithHash(model.password.trim(), currentUser.password)) {
			model.password = "";
			return forbidden({
				message: "Invalid username or password",
				data: model,
			});
		}

		// TODO: Should we make the user select a new password, so that it can't
		// be accessed from env()?

		// Make sure the name and password match the env variables
		if (model.username !== env().USERNAME || model.password !== env().PASSWORD) {
			model.password = "";
			return forbidden({
				message: "Invalid username or password",
				data: model,
			});
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
			about: "",
			location: model.location ?? "",
			image: model.image ?? "",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// TODO: Send them to the login page instead
		const code = uuid().toString();
		const sevenDays = 7 * 24 * 60 * 60;

		await transaction(db, async (tx) => {
			try {
				// Insert the user into the database
				const newUser = currentUser
					? (
							await tx
								.update(usersTable)
								.set(user)
								.where(eq(usersTable.id, currentUser.id))
								.returning({ id: usersTable.id })
						)[0]
					: (await tx.insert(usersTable).values(user).returning({ id: usersTable.id }))[0];

				// Create a user token
				await tx.insert(userTokensTable).values({
					user_id: newUser.id,
					code: code,
					expires_at: new Date(new Date().getTime() + sevenDays * 1000),
				});

				// Create an activity record
				await tx.insert(activityTable).values({
					url: user.url,
					text: "You set up your account",
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
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
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
