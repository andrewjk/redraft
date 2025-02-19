import postPublish from "@/lib/posts/postPublish";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postPublish(request, user.token);
	},
} satisfies ServerEndPoint;
