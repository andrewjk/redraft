import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";
import feedList from "../api/feed/+server";
import likeFeedPost from "../feed/_actions/likeFeedPost";
import reactToFeedPost from "../feed/_actions/reactToFeedPost";
import saveFeedPost from "../feed/_actions/saveFeedPost";
import publishPost from "../posts/_actions/publishPost";
import savePost from "../posts/_actions/savePost";

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

		const [{ feed, feedCount }] = await Promise.all([
			api.get(`feed?${search}`, feedList, params, user?.token),
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
