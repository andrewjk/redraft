import * as api from "@/lib/api";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import publishPost from "../../_actions/publishPost";
import savePost from "../../_actions/savePost";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get(`posts/edit/${params.slug}`, params, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ post: result });
	},
	actions: {
		savePost,
		publishPost,
	},
} satisfies PageServerEndPoint;
