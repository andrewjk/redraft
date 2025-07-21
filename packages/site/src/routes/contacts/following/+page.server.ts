import { type PageServerEndPoint } from "@torpor/build";
import * as api from "../../../lib/api";
import profileFollowing from "../../api/contacts/following/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		return await api.get("contacts/following", profileFollowing, params, user?.token);
	},
} satisfies PageServerEndPoint;
