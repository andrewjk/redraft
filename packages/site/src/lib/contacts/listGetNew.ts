import { notFound, ok, serverError } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import type ListEditModel from "../../types/contacts/ListEditModel";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export default async function listGetNew(code: string) {
	let errorMessage = "";

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get all followers
		// TODO: Allow the user to search for users
		const followedByQuery = db.query.followedByTable.findMany({
			where: isNull(followedByTable.deleted_at),
			orderBy: followedByTable.name,
		});

		const [user, followedBy] = await Promise.all([userQuery, followedByQuery]);

		if (!user) {
			return notFound();
		}

		const result = {
			id: -1,
			name: "",
			description: "",
			users: followedBy.map((f) => {
				return {
					id: f.id,
					url: f.url,
					name: f.name,
					image: f.image,
					included: false,
				};
			}),
		} satisfies ListEditModel;

		return ok({ list: result });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
