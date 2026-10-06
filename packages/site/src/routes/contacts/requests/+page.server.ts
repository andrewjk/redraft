import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import followRequests from "../../../api/contacts/requests/+server";
import followApprove from "../../../api/follow/approve/+server";
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

		// Load the user's follow requests
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`contacts/requests?${search}`, followRequests, params, user.token);
		if (!result.ok) {
			return result;
		}
		const { requests, requestCount } = await result.json();

		const pageCount = Math.ceil(requestCount / PAGE_SIZE);

		return ok({ requests, pageCount });
	},
	actions: {
		approve: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post("follow/approve", followApprove, params, model, user.token);
		},
	},
} satisfies PageServerEndPoint;
