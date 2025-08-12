import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable, followingTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import type { MessageGroupModel } from "./MessageGroupModel";

/**
 * Gets the details for creating a message group and message.
 */
export default async function messageCreateGet(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the user with the supplied slug
		const followedByQuery = db.query.followedByTable.findFirst({
			where: eq(followedByTable.slug, slug),
		});

		// Get the user with the supplied slug
		const followingQuery = db.query.followingTable.findFirst({
			where: eq(followingTable.slug, slug),
		});

		const [user, followedBy, following] = await Promise.all([
			userQuery,
			followedByQuery,
			followingQuery,
		]);

		if (!user) {
			return unauthorized();
		}
		if (!followedBy && !following) {
			return notFound();
		}

		const result = {
			messageGroup: {
				slug: followedBy?.slug ?? following?.slug ?? "",
				url: followedBy?.url ?? following?.url ?? "",
				image: followedBy?.image ?? following?.image ?? "",
				name: followedBy?.name ?? following?.name ?? "",
			},
			messages: [],
		} satisfies MessageGroupModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
