import { type PageServerEndPoint } from "@torpor/build";
import * as api from "../../../lib/api";
import tagsGet from "../../api/tags/[slug]/+server";

export default {
	load: async ({ params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await api.get(`tags/[slug=${params.slug}]`, tagsGet, params);
	},
} satisfies PageServerEndPoint;
