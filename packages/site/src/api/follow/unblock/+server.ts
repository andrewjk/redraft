import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followUnblock from "../../../lib/follow/followUnblock";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followUnblock(request, user.code);
	},
} satisfies ServerEndPoint;
