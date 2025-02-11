import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		const fuser = appData.fuser;
		return ok({
			user: user && {
				email: user.email,
				name: user.name,
				image: user.image,
				bio: user.bio,
			},
			fuser: fuser && {
				email: fuser.email,
				name: fuser.name,
				image: fuser.image,
				bio: fuser.bio,
			},
		});
	},
} satisfies PageServerEndPoint;
