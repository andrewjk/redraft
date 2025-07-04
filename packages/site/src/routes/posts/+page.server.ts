import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";
import postsList from "../api/posts/+server";
import publishPost from "../posts/_actions/publishPost";
import savePost from "../posts/_actions/savePost";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		const follower = appData.follower;

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's posts
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const { posts, postsCount } = await api.get(
			`posts?${search}`,
			postsList,
			params,
			user?.token || follower?.token,
		);

		const pageCount = Math.ceil(postsCount / PAGE_SIZE);

		return ok({ posts, pageCount });
	},
	actions: {
		savePost,
		publishPost,
	},
} satisfies PageServerEndPoint;
