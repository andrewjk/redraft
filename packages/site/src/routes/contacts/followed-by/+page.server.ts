import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import followedByList from "../../../api/contacts/followed-by/+server";
import followBlock from "../../../api/follow/block/+server";
import followRemove from "../../../api/follow/remove/+server";
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

		// Load the user's followers
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(
			`contacts/followed-by?${search}`,
			followedByList,
			params,
			user.token,
		);
		if (!result.ok) {
			return result;
		}
		const { followedBy, followedByCount } = await result.json();

		const pageCount = Math.ceil(followedByCount / PAGE_SIZE);

		return ok({ followedBy, pageCount });
	},
	actions: {
		remove: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post("follow/remove", followRemove, params, model, user.token);
		},
		block: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post("follow/block", followBlock, params, model, user.token);
		},
	},
} satisfies PageServerEndPoint;
