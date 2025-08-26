import { notFound, ok, serverError } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import type { ListEditModel } from "./ListEditModel";

export default async function listGetNew(code: string) {
	let errorMessage: string | undefined;

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
					image: f.image + "?w=80",
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
