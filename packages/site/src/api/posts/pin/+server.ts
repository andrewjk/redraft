import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postPin from "../../../lib/posts/postPin";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postPin(request, user.code);
	},
} satisfies ServerEndPoint;
