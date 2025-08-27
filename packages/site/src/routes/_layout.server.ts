import type { PageServerEndPoint } from "@torpor/build";
import { ok, seeOther } from "@torpor/build/response";
import database from "../data/database";
import env from "../lib/env";
import ensureSlash from "../lib/utils/ensureSlash";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		const db = database();
		const currentUser = await db.query.usersTable.findFirst({
			columns: {
				name: true,
				image: true,
				bio: true,
				location: true,
				message_count: true,
				notification_count: true,
			},
		});
		if (!currentUser && url.pathname !== "/account/setup") {
			return seeOther("/account/setup");
		}

		return ok({
			username: params.user,
			base: params.user ? `/${params.user}/` : "/",
			user: user && {
				url: ensureSlash(user.url),
				name: user.name,
				image: user.image,
				notificationCount: currentUser?.notification_count,
				messageCount: currentUser?.message_count,
			},
			follower: follower && {
				url: ensureSlash(follower.url),
				name: follower.name,
				image: follower.image,
			},
			viewing: {
				url: ensureSlash(env().SITE_LOCATION),
				name: currentUser?.name,
				image: currentUser?.image,
				bio: currentUser?.bio,
				location: currentUser?.location,
			},
		});
	},
} satisfies PageServerEndPoint;
