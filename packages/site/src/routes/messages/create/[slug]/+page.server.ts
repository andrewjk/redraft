import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import messageCreate from "../../../../api/messages/create/[slug]/+server";
import * as api from "../../../../lib/api";
import formDataToObject from "../../../../lib/utils/formDataToObject";

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

			const result = await api.post(
				`messages/create/[slug=${params.slug}]`,
				messageCreate,
				params,
				model,
				user.token,
			);
			if (!result.ok) {
				return result;
			}

			const createdModel: { slug: string } = await result.json();

			return seeOther(
				params.user
					? `/${params.user}/messages/groups/${createdModel.slug}`
					: `/messages/groups/${createdModel.slug}`,
			);
		},
	},
} satisfies PageServerEndPoint;
