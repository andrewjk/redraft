import * as api from "@/lib/api";
import { FRONT_PAGE_SIZE } from "@/lib/constants";
import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import savePost from "./feed/_actions/saveFeedPost";
import pinPost from "./posts/_actions/pinPost";
import publishPost from "./posts/_actions/publishPost";

export default {
	load: async () => {
		// Load the user's profile and 5ish latest posts
		const search = new URLSearchParams();
		search.set("limit", FRONT_PAGE_SIZE.toString());
		const [profile, { posts }] = await Promise.all([
			api.get("profile/preview"),
			api.get(`posts?${search}`),
		]);
		return ok({ profile, posts });
	},
	actions: {
		savePost,
		publishPost,
		pinPost,
	},
} satisfies PageServerEndPoint;
