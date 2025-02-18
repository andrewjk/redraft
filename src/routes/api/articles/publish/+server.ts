import articlePublish from "@/lib/articles/articlePublish";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return articlePublish(request, user.token);
	},
} satisfies ServerEndPoint;
