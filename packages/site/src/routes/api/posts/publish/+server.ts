import postPublish from "@/lib/posts/postPublish";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postPublish(request, params, user.token, user.code);
	},
} satisfies ServerEndPoint;
