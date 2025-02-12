import * as api from "@/lib/api.js";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("profile/follow-requests", user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
	actions: {
		approve: async ({ request, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("follow/approve", model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return ok();
		},
	},
} satisfies PageServerEndPoint;
