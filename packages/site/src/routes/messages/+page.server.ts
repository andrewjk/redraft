import { type PageServerEndPoint, ServerLoadEvent } from "@torpor/build";
import { ok, unauthorized } from "@torpor/build/response";
import messageGroupList from "../../api/messages/+server";
import markRead from "../../api/messages/mark-read/+server";
import * as api from "../../lib/api";
import { PAGE_SIZE } from "../../lib/constants";
import formDataToObject from "../../lib/utils/formDataToObject";

export default {
	load: async ({ appData, url, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		// Get URL params
		const page = +(url.searchParams.get("page") || 1);

		// Load the user's message groups
		const search = new URLSearchParams();
		search.set("limit", PAGE_SIZE.toString());
		search.set("offset", ((page - 1) * PAGE_SIZE).toString());

		const result = await api.get(`messages?${search}`, messageGroupList, params, user.token);
		if (!result.ok) {
			return result;
		}
		const { messages, messagesCount } = await result.json();

		const pageCount = Math.ceil(messagesCount / PAGE_SIZE);

		return ok({ messages, pageCount });
	},
	actions: {
		markRead: async function ({ appData, request, params }: ServerLoadEvent) {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post(`messages/mark-read`, markRead, params, model, user.token);
		},
	},
} satisfies PageServerEndPoint;
