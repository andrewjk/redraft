import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../lib/api";
import formDataToObject from "../../lib/utils/formDataToObject";

export default {
	actions: {
		default: async ({ appData, request, params }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("follow", params, model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return ok("Message sent");
		},
	},
} satisfies PageServerEndPoint;
