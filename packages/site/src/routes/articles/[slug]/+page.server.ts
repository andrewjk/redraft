import { type PageServerEndPoint } from "@torpor/build";
import * as api from "../../../lib/api";
import articlesGet from "../../api/articles/[slug]/+server";
import createComment from "../../posts/_actions/createComment";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		return await api.get(
			`articles/[slug=${params.slug}]`,
			articlesGet,
			params,
			user?.token || follower?.token,
		);
	},
	actions: {
		createComment,
	},
} satisfies PageServerEndPoint;
