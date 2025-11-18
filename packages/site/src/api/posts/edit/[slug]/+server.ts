import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postEdit from "../../../../lib/posts/postEdit";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await postEdit(params.slug, user.code);
	},
} satisfies ServerEndPoint;
