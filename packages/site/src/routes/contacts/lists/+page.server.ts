import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import lists from "../../api/contacts/lists/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("contacts/lists", lists, params, user.token);
	},
} satisfies PageServerEndPoint;
