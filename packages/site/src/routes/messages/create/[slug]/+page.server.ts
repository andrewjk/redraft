import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../../lib/api";
import formDataToObject from "../../../../lib/utils/formDataToObject";
import messageCreate from "../../../api/messages/create/[slug]/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get(
			`messages/create/[slug=${params.slug}]`,
			messageCreate,
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
				`messages/create/[slug=${params.slug}]`,
				messageCreate,
				params,
				model,
				user.token,
			);
		},
	},
} satisfies PageServerEndPoint;
