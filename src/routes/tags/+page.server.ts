import * as api from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";

export default {
	load: async ({ url }) => {
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

		const { tags, tagsCount } = await api.get(`tags?${search}`);

		const pageCount = Math.ceil(tagsCount / PAGE_SIZE);

		return ok({ tags, pageCount });
	},
} satisfies PageServerEndPoint;
