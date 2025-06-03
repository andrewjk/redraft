import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../../lib/api";
import postsEdit from "../../../api/posts/edit/[slug]/+server";
import publishPost from "../../../posts/_actions/publishPost";
import savePost from "../../../posts/_actions/savePost";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get(`posts/edit/[slug=${params.slug}]`, postsEdit, params, user.token);
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
