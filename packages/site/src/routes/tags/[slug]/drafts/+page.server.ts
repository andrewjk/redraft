import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import tagsDrafts from "../../../../api/tags/[slug]/drafts/+server";
import * as api from "../../../../lib/api";
import { PAGE_SIZE } from "../../../../lib/constants";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's posts
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		return await api.get(
			`tags/[slug=${params.slug}]/drafts?${search}`,
			tagsDrafts,
			params,
			user.token,
		);
	},
} satisfies PageServerEndPoint;
