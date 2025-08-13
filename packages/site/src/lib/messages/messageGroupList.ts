import { ok, serverError, unauthorized } from "@torpor/build/response";
import { desc, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { messageGroupsTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";

export type MessagePreview = {
	slug: string;
	url: string;
	image: string;
	name: string;
	newestAt: Date;
	text: string;
	sent: boolean;
	unreadCount: number;
};

export type MessagesList = {
	messages: MessagePreview[];
	messagesCount: number;
};

export default async function messageGroupList(
	code: string,
	limit?: number,
	offset?: number,
): Promise<Response> {
	let errorMessage: string | undefined;

	try {
		const db = database();

		// Get the current user
		const currentUserQuery = db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});

		const condition = isNull(messageGroupsTable.deleted_at);

		// Get the message groups from the database, with their latest messages
		const messagesQuery = db.query.messageGroupsTable.findMany({
			limit,
			offset,
			orderBy: desc(messageGroupsTable.newest_at),
			where: condition,
			with: {
				followedBy: true,
				following: true,
				newest: true,
			},
		});

		// Get the total count
		const messagesCountQuery = db.$count(messageGroupsTable, condition);

		const [currentUser, messagesData, messagesCount] = await Promise.all([
			currentUserQuery,
			messagesQuery,
			messagesCountQuery,
		]);
		if (!currentUser) {
			return unauthorized();
		}

		// Create views
		const messages = messagesData.map((l) => {
			return {
				slug: l.slug,
				url: l.followedBy?.url ?? l.following?.url ?? "",
				image: l.followedBy?.image ?? l.following?.image ?? "",
				name: l.followedBy?.name ?? l.following?.name ?? "",
				newestAt: l.newest_at,
				text: l.newest?.text ?? "",
				sent: l.newest?.sent ?? false,
				unreadCount: l.unread_count,
			} satisfies MessagePreview;
		});

		const result = {
			messages,
			messagesCount,
		};

		return ok(result);
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
