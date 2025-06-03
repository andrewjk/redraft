import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import followBlock from "../../api/follow/block/+server";
import followedBy from "../../api/profile/followed-by/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("profile/followed-by", followedBy, params, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
	actions: {
		block: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("follow/block", followBlock, params, model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			return ok();
		},
	},
} satisfies PageServerEndPoint;
