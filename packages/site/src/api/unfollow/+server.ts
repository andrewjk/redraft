import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import unfollowSend from "../../lib/unfollow/unfollowSend";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await unfollowSend(request, user.code);
	},
} satisfies ServerEndPoint;
