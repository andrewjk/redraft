import * as api from "@/lib/api";
import { FRONT_PAGE_SIZE } from "@/lib/constants";
import logout from "@/routes/account/_actions/logout";
import savePost from "@/routes/feed/_actions/saveFeedPost";
import pinPost from "@/routes/posts/_actions/pinPost";
import publishPost from "@/routes/posts/_actions/publishPost";
import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: async ({ appData, params }) => {
		let user = appData.user;
		let follower = appData.follower;

		// Load the user's profile and 5ish latest posts
		const search = new URLSearchParams();
		search.set("limit", FRONT_PAGE_SIZE.toString());
		const [profile, { posts }] = await Promise.all([
			api.get("profile/preview", params),
			api.get(`posts?${search}`, params, user?.token || follower?.token),
		]);
		return ok({ profile, posts });
	},
	actions: {
		savePost,
		publishPost,
		pinPost,
		logout,
	},
} satisfies PageServerEndPoint;
