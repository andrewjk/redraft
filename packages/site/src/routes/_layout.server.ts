import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import database from "../data/database";
import env from "../lib/env";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		const db = database();
		const currentUser = await db.query.usersTable.findFirst({
			columns: { name: true, image: true },
		});

		return ok({
			url: env().SITE_LOCATION,
			name: currentUser?.name,
			image: currentUser?.image,
			username: params.user,
			base: params.user ? `/${params.user}/` : "/",
			user: user && {
				url: user.url,
				name: user.name,
				image: user.image,
			},
			follower: follower && {
				url: follower.url,
				name: follower.name,
				image: follower.image,
			},
		});
	},
} satisfies PageServerEndPoint;
