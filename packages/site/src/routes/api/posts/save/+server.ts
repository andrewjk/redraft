import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postSave from "../../../../lib/posts/postSave";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postSave(request, user.code);
	},
} satisfies ServerEndPoint;
