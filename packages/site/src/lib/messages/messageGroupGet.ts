import { notFound, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { messageGroupsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import type { MessageGroupModel } from "./MessageGroupModel";

export default async function messageGroupGet(slug: string, code: string) {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current (only) user
		const userQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		// Get the message group with the supplied slug
		const messageGroupQuery = db.query.messageGroupsTable.findFirst({
			where: eq(messageGroupsTable.slug, slug),
			with: {
				followedBy: true,
				following: true,
				messages: true,
			},
		});

		const [user, messageGroup] = await Promise.all([userQuery, messageGroupQuery]);

		if (!user) {
			return unauthorized();
		}
		if (!messageGroup) {
			return notFound();
		}

		const result = {
			messageGroup: {
				slug: messageGroup.slug,
				url: messageGroup.followedBy?.url ?? messageGroup.following?.url ?? "",
				image: messageGroup.followedBy?.image ?? messageGroup.following?.image ?? "",
				name: messageGroup.followedBy?.name ?? messageGroup.following?.name ?? "",
			},
			messages: messageGroup.messages.map((m) => {
				return {
					id: m.id,
					text: m.text,
					sent: m.sent,
					sentAt: m.created_at,
					delivered: m.delivered,
				};
			}),
		} satisfies MessageGroupModel;

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
