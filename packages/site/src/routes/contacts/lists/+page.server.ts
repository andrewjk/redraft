import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import listList from "../../../api/contacts/lists/+server";
import * as api from "../../../lib/api";
import { PAGE_SIZE } from "../../../lib/constants";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's lists
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`contacts/lists?${search}`, listList, params, user.token);
		if (!result.ok) {
			return result;
		}
		const { lists, listsCount } = await result.json();

		const pageCount = Math.ceil(listsCount / PAGE_SIZE);

		return ok({ lists, pageCount });
	},
} satisfies PageServerEndPoint;
