import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import * as api from "../../../../lib/api";
import formDataToObject from "../../../../lib/utils/formDataToObject";
import messageGroup from "../../../api/messages/groups/[slug]/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get(`messages/groups/[slug=${params.slug}]`, messageGroup, params, user.token);
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
				`messages/groups/[slug=${params.slug}]`,
				messageGroup,
				params,
				model,
				user.token,
			);
			if (!result.ok) {
				return result;
			}

			return seeOther(
				params.user
					? `/${params.user}/messages/groups/${params.slug}`
					: `/messages/groups/${params.slug}`,
			);
		},
	},
} satisfies PageServerEndPoint;
