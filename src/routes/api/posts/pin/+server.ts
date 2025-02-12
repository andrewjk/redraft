import postPin from "@/lib/posts/postPin";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return postPin(request);
	},
} satisfies ServerEndPoint;
