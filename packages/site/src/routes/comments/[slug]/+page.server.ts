import { type PageServerEndPoint } from "@torpor/build";
import * as api from "../../../lib/api";
import commentsGet from "../../api/comments/[slug]/+server";

export default {
	load: async ({ params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await api.get(`comments/[slug=${params.slug}]`, commentsGet, params);
	},
} satisfies PageServerEndPoint;
