import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import followRequests from "../../api/contacts/requests/+server";
import followApprove from "../../api/follow/approve/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("contacts/requests", followRequests, params, user.token);
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
