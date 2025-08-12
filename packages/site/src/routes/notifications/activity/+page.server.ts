import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import profileActivity from "../../api/notifications/activity/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("notifications/activity", profileActivity, params, user.token);
	},
} satisfies PageServerEndPoint;
