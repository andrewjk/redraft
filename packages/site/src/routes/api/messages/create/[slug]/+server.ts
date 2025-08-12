import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import { eq, or } from "drizzle-orm";
import database from "../../../../../data/database";
import { followedByTable, followingTable, messageGroupsTable } from "../../../../../data/schema";
import messageCreateGet from "../../../../../lib/messages/messageCreateGet";
import messageCreatePost from "../../../../../lib/messages/messageCreatePost";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const db = database();

		// Check whether there's already a message group, and redirect to it if so
		const messageGroup = await db.query.messageGroupsTable.findFirst({
			where: or(
				eq(
					messageGroupsTable.followed_by_id,
					db
						.select({ id: followedByTable.id })
						.from(followedByTable)
						.where(eq(followedByTable.slug, params.slug)),
				),
				eq(
					messageGroupsTable.following_id,
					db
						.select({ id: followingTable.id })
						.from(followingTable)
						.where(eq(followingTable.slug, params.slug)),
				),
			),
			columns: { slug: true },
		});

		if (messageGroup) {
			return seeOther(
				params.user
					? `/${params.user}/messages/group/${messageGroup.slug}`
					: `/messages/group/${messageGroup.slug}`,
			);
		}

		return await messageCreateGet(params.slug, user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await messageCreatePost(request, user.code);
		if (!result.ok) {
			return result;
		}

		const model = await result.json();

		return seeOther(
			params.user
				? `/${params.user}/messages/groups/${model.slug}`
				: `/messages/groups/${model.slug}`,
		);
	},
} satisfies ServerEndPoint;
