import postCreate from "@/lib/posts/postCreate";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return postCreate(request, appData.user.username);
	},
} satisfies ServerEndPoint;
