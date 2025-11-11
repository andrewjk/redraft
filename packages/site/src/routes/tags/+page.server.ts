import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";
import type TagListModel from "../../types/tags/TagListModel";
import tagsList from "../api/tags/+server";

export default {
	load: async ({ url, params }) => {
		// TODO: Filter by permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's tags
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`tags?${search}`, tagsList, params);
		if (!result.ok) {
			return result;
		}
		const { tags, tagsCount }: TagListModel = await result.json();

		const pageCount = Math.ceil(tagsCount / PAGE_SIZE);

		return ok({ tags, pageCount });
	},
} satisfies PageServerEndPoint;
