import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import followedBy from "../../api/contacts/followed-by/+server";
import followBlock from "../../api/follow/block/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("contacts/followed-by", followedBy, params, user.token);
	},
	actions: {
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
