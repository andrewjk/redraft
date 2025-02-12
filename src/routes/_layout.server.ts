import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		const fuser = appData.fuser;
		return ok({
			user: user && {
				url: user.url,
				name: user.name,
				image: user.image,
				bio: user.bio,
			},
			fuser: fuser && {
				url: fuser.url,
				name: fuser.name,
				image: fuser.image,
				bio: fuser.bio,
			},
		});
	},
} satisfies PageServerEndPoint;
