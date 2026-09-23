import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import contactsBlocked from "../../../api/contacts/blocked/+server";
import followUnblock from "../../../api/follow/unblock/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("contacts/blocked", contactsBlocked, params, user.token);
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
