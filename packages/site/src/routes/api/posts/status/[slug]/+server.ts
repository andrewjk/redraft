import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postStatus from "../../../../../lib/posts/postStatus";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postStatus(params.slug, user.code);
	},
} satisfies ServerEndPoint;
