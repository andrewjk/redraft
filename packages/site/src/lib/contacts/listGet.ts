import { notFound, ok, serverError } from "@torpor/build/response";
import { eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, listsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import type { ListEditModel } from "./ListEditModel";

export default async function listGet(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the list with the supplied slug
		const listQuery = db.query.listsTable.findFirst({
			where: eq(listsTable.slug, slug),
			with: {
				users: true,
			},
		});

		// Get all followers
		// TODO: Only get the followers that are in this list, and allow the user to search for others
		const followedByQuery = db.query.followedByTable.findMany({
			where: isNull(followedByTable.deleted_at),
			orderBy: followedByTable.name,
		});

		const [user, list, followedBy] = await Promise.all([userQuery, listQuery, followedByQuery]);

		if (!user) {
			return notFound();
		}
		if (!list) {
			return notFound();
		}

		const result = {
			id: list.id,
			name: list.name,
			description: list.description,
			users: followedBy.map((f) => {
				return {
					id: f.id,
					url: f.url,
					name: f.name,
					image: f.image,
					included: !!list.users.find((u) => u.user_id === f.id),
				};
			}),
		} satisfies ListEditModel;

		return ok({ list: result });
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
