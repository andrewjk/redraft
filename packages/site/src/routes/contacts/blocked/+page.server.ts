import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import contactsBlocked from "../../../api/contacts/blocked/+server";
import followUnblock from "../../../api/follow/unblock/+server";
import * as api from "../../../lib/api";
import { PAGE_SIZE } from "../../../lib/constants";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's blocked users
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`contacts/blocked?${search}`, contactsBlocked, params, user.token);
		if (!result.ok) {
			return result;
		}
		const { blocked, blockedCount } = await result.json();

		const pageCount = Math.ceil(blockedCount / PAGE_SIZE);

		return ok({ blocked, pageCount });
	},
	actions: {
		unblock: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post("follow/unblock", followUnblock, params, model, user.token);
		},
	},
} satisfies PageServerEndPoint;
