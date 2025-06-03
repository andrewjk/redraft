import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";
import * as api from "../../../../lib/api";
import tagsDrafts from "../../../api/tags/[slug]/drafts/+server";

export default {
	load: async ({ params }) => {
		// TODO: Check permissions
		//const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const result = await api.get(`tags/[slug=${params.slug}]/drafts`, tagsDrafts, params);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
} satisfies PageServerEndPoint;
