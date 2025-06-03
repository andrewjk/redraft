import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import postsGet from "../../api/posts/[slug]/+server";
import createComment from "../../posts/_actions/createComment";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		const result = await api.get(
			`posts/[slug=${params.slug}]`,
			postsGet,
			params,
			user?.token || follower?.token,
		);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ post: result });
	},
	actions: {
		createComment,
	},
} satisfies PageServerEndPoint;
