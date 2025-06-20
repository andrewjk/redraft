import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import profileFollowing from "../../api/contacts/following/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const result = await api.get("contacts/following", profileFollowing, params, user?.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
} satisfies PageServerEndPoint;
