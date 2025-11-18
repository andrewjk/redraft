import { type PageServerEndPoint, ServerLoadEvent } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import profileNotifications from "../../api/notifications/+server";
import markRead from "../../api/notifications/mark-read/+server";
import * as api from "../../lib/api";
import formDataToObject from "../../lib/utils/formDataToObject";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("notifications", profileNotifications, params, user.token);
	},
	actions: {
		markRead: async function ({ appData, request, params }: ServerLoadEvent) {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post(`notifications/mark-read`, markRead, params, model, user.token);
		},
	},
} satisfies PageServerEndPoint;
