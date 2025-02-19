import * as api from "@/lib/api";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";
import createComment from "../_actions/createComment";

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
		createComment,
	},
} satisfies PageServerEndPoint;
