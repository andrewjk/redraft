import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";

export default {
	load: async ({ url, params }) => {
		// TODO: Filter by permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's articles
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const { posts, postsCount } = await api.get(`articles?${search}`, params);

		const pageCount = Math.ceil(postsCount / PAGE_SIZE);

		return ok({ posts, pageCount });
	},
} satisfies PageServerEndPoint;
