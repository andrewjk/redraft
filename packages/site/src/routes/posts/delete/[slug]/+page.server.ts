import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import postsPreview from "../../../../api/posts/preview/[slug]/+server";
import * as api from "../../../../lib/api";
import deletePost from "../../../posts/_actions/deletePost";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Just get the post from the preview endpoint
		return await api.get(`posts/preview/[slug=${params.slug}]`, postsPreview, params, user.token);
	},
	actions: {
		default: deletePost,
	},
} satisfies PageServerEndPoint;
