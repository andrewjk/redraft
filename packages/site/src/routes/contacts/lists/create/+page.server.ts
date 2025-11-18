import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import listsCreate from "../../../../api/contacts/lists/create/+server";
import * as api from "../../../../lib/api";
import formDataToObject from "../../../../lib/utils/formDataToObject";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("contacts/lists/create", listsCreate, params, user.token);
	},
	actions: {
		default: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post(
				"contacts/lists/create",
				listsCreate,
				params,
				model,
				user.token,
			);
			if (!result.ok) {
				return result;
			}

			return seeOther(params.user ? `/${params.user}/contacts/lists` : "/contacts/lists");
		},
	},
} satisfies PageServerEndPoint;
