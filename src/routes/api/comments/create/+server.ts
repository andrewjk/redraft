import commentCreate from "@/lib/comments/commentCreate";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request }) => {
		const user = appData.follower || appData.user;
		if (!user) {
			return unauthorized();
		}

		return await commentCreate(request, user.url, user.token);
	},
} satisfies ServerEndPoint;
