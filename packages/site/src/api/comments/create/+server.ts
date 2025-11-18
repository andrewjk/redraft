import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import commentCreate from "../../../lib/comments/commentCreate";

export default {
	post: async ({ appData, request, params }) => {
		const user = appData.follower || appData.user;
		if (!user) {
			return unauthorized();
		}

		return await commentCreate(request, params, user.url, user.shared_key, user.code, user.token);
	},
} satisfies ServerEndPoint;
