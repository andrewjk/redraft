import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		const fuser = appData.fuser;
		return ok({
			user: user && {
				username: user.username,
				email: user.email,
				image: user.image,
				bio: user.bio,
			},
			fuser: fuser && {
				username: fuser.username,
				email: fuser.email,
				image: fuser.image,
				bio: fuser.bio,
			},
		});
	},
} satisfies PageServerEndPoint;
