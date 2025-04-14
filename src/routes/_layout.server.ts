import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		const follower = appData.follower;
		const url = process.env.SITE_LOCATION;
		return ok({
			url,
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
