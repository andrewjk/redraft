import type { PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		return ok({
			user: user && {
				username: user.username,
				email: user.email,
				image: user.image,
				bio: user.bio,
			},
		});
	},
} satisfies PageServerEndPoint;
