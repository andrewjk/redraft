import postPin from "@/lib/posts/postPin";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postPin(request, user.code);
	},
} satisfies ServerEndPoint;
