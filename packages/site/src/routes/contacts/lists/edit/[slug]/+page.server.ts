import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../../../lib/api";
import formDataToObject from "../../../../../lib/utils/formDataToObject";
import listsEdit from "../../../../api/contacts/lists/edit/[slug]/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get(
			`contacts/lists/edit/[slug=${params.slug}]`,
			listsEdit,
			params,
			user.token,
		);
	},
	actions: {
		default: async ({ request, params, appData }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			return await api.post(
				`contacts/lists/edit/[slug=${params.slug}]`,
				listsEdit,
				params,
				model,
				user.token,
			);
		},
	},
} satisfies PageServerEndPoint;
