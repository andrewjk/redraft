import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import tagsGet from "../../api/tags/[slug]/+server";

export default {
	load: async ({ params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const result = await api.get(`tags/[slug=${params.slug}]`, tagsGet, params);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
} satisfies PageServerEndPoint;
