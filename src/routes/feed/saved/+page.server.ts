import * as api from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import publishPost from "@/routes/posts/_actions/publishPost";
import savePost from "@/routes/posts/_actions/savePost";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import likeFeedPost from "../_actions/likeFeedPost";
import reactToFeedPost from "../_actions/reactToFeedPost";
import saveFeedPost from "../_actions/saveFeedPost";

export default {
	load: async ({ url, params, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's feed posts
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());
		search.set("saved", "");

		const [{ feed, feedCount }] = await Promise.all([
			api.get(`feed?${search}`, params, user?.token),
		]);

		const pageCount = Math.ceil(feedCount / PAGE_SIZE);

		return ok({ feed, pageCount });
	},
	actions: {
		savePost,
		publishPost,
		likeFeedPost,
		saveFeedPost,
		reactToFeedPost,
	},
} satisfies PageServerEndPoint;
