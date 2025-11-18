import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followRequest from "../../../lib/follow/followRequest";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followRequest(request, user.code);
	},
} satisfies ServerEndPoint;
