import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postResend from "../../../../lib/posts/postResend";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postResend(request, user.code);
	},
} satisfies ServerEndPoint;
