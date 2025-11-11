import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";
import type PostListModel from "../../types/posts/PostListModel";
import eventsList from "../api/events/+server";
import publishPost from "../posts/_actions/publishPost";
import savePost from "../posts/_actions/savePost";

export default {
	load: async ({ url, params }) => {
		// TODO: Filter by permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's events
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`events?${search}`, eventsList, params);
		if (!result.ok) {
			return result;
		}
		const { posts, postsCount }: PostListModel = await result.json();

		const pageCount = Math.ceil(postsCount / PAGE_SIZE);

		return ok({ posts, pageCount });
	},
	actions: {
		savePost,
		publishPost,
	},
} satisfies PageServerEndPoint;
