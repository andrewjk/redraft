import * as api from "@/lib/api";
import createComment from "@/routes/posts/_actions/createComment";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		const result = await api.get(`posts/${params.slug}`, params, user?.token || follower?.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ post: result });
	},
	actions: {
		createComment,
	},
} satisfies PageServerEndPoint;
