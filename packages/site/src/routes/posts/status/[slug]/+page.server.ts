import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postsStatus from "../../../../api/posts/status/[slug]/+server";
import * as api from "../../../../lib/api";
import resendPost from "../../_actions/resendPost";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get(`posts/status/[slug=${params.slug}]`, postsStatus, params, user.token);
	},
	actions: {
		resendPost,
	},
} satisfies PageServerEndPoint;
