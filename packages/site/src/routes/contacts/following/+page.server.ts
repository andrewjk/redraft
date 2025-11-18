import { type PageServerEndPoint } from "@torpor/build";
import profileFollowing from "../../../api/contacts/following/+server";
import * as api from "../../../lib/api";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await api.get("contacts/following", profileFollowing, params, user?.token);
	},
} satisfies PageServerEndPoint;
