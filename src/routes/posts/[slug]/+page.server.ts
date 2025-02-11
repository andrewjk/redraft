import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const result = await api.get(`posts/${params.slug}`);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ post: result });
	},
	actions: {
		createComment: async ({ appData, request }) => {
			// Comments can be made by a following user, or by the main user
			const user = appData.fuser || appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const comment = formDataToObject(data);

			const result = await api.post(`comments/create`, comment, user.token);
			if (result.errors) {
				return unprocessable(result);
			}
		},
	},
} satisfies PageServerEndPoint;
