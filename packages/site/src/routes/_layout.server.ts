import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import env from "../lib/env";

export default {
	load: ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;
		const url = env().SITE_LOCATION;
		return ok({
			url,
			username: params.user,
			user: user && {
				url: user.url,
				name: user.name,
				image: user.image,
				bio: user.bio,
			},
			follower: follower && {
				url: follower.url,
				name: follower.name,
				image: follower.image,
				bio: follower.bio,
			},
		});
	},
} satisfies PageServerEndPoint;
