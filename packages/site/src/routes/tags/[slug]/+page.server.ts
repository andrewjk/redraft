import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import tagsGet from "../../../api/tags/[slug]/+server";
import * as api from "../../../lib/api";
import { PAGE_SIZE } from "../../../lib/constants";

export default {
	load: async ({ url, params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the tagged posts
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`tags/[slug=${params.slug}]?${search}`, tagsGet, params);
		if (!result.ok) {
			return result;
		}
		const { tag, posts, postsCount } = await result.json();

		const pageCount = Math.ceil(postsCount / PAGE_SIZE);

		return ok({ tag, posts, pageCount });
	},
} satisfies PageServerEndPoint<"/tags/[slug]">;
