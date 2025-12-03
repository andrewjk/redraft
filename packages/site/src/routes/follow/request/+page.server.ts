import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import followSend from "../../../api/follow/send/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default {
	actions: {
		default: async ({ appData, request, params }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("follow/send", followSend, params, model, user.token);
			if (!result.ok) {
				return result;
			}

			return seeOther(params.user ? `/${params.user}` : "/");
		},
	},
} satisfies PageServerEndPoint;
