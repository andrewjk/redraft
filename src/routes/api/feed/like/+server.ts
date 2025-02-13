import feedLike from "@/lib/feed/feedLike";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return feedLike(request);
	},
} satisfies ServerEndPoint;
