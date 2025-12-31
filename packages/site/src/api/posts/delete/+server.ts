import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postDelete from "../../../lib/posts/postDelete";

export default {
	post: async ({ appData, request, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postDelete(request, params, user.token, user.code);
	},
} satisfies ServerEndPoint;
