import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postSend from "../../../../lib/posts/postSend";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postSend(request, user.code);
	},
} satisfies ServerEndPoint;
