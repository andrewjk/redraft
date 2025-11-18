import { type PageServerEndPoint } from "@torpor/build";
import postsList from "../api/posts/+server";
import * as api from "../lib/api";
import { FRONT_PAGE_SIZE } from "../lib/constants";
import logout from "../routes/account/_actions/logout";
import savePost from "../routes/feed/_actions/saveFeedPost";
import pinPost from "../routes/posts/_actions/pinPost";
import publishPost from "../routes/posts/_actions/publishPost";

export default {
	load: async ({ appData, params }) => {
		let user = appData.user;
		let follower = appData.follower;

		// Load the user's profile and 5ish latest posts
		const search = new URLSearchParams();
		search.set("limit", FRONT_PAGE_SIZE.toString());
		return await api.get(`posts?${search}`, postsList, params, user?.token || follower?.token);
	},
	actions: {
		savePost,
		publishPost,
		pinPost,
		logout,
	},
} satisfies PageServerEndPoint;
